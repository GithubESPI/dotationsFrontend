import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Equipment } from '../types/equipment';

/**
 * Fonction utilitaire interne pour formater un équipement en ligne de données propres
 */
function prepareEquipmentData(equipments: Equipment[]) {
    return equipments.map(eq => {
        const attrs = eq.jiraAttributes || {};

        // Récupération intelligente du nom
        let brand = attrs['Marque'] || attrs['Brand'] || attrs['Manufacturer'] || attrs['Constructeur'] || eq.brand;
        let model = attrs['Modèle'] || attrs['Model'] || attrs['Product Name'] || attrs['Name'] || eq.model;
        if (brand === 'Inconnu') brand = '';
        if (model === 'Inconnu') model = '';
        const fallbackName = `${brand} ${model}`.trim() || 'Équipement Inconnu';
        const name = attrs['Name'] || fallbackName;

        // Récupération de l'utilisateur
        const user = attrs['Utilisateur'] || attrs['User'] || attrs['user'] || (eq.currentUserId as any)?.displayName || '';

        // Récupération du statut nettoyé
        let status = attrs['Status'] || eq.status || '';
        if (status.toUpperCase() === 'DISPONIBLE' && 
            (eq.type === 'PC_PORTABLE' || attrs['Type'] === 'Laptop' || attrs['Type'] === 'Chromebook')) {
                status = 'En stock';
        }

        return {
            'Nom / Objet': name,
            'Type': eq.objectTypeName || eq.type || '',
            'Marque': brand,
            'Modèle': model,
            'Numéro de Série': eq.isMissingSerialNumber ? 'Manquant' : (eq.serialNumber || ''),
            'Statut': status,
            'Utilisateur': user,
            'Lieu': attrs['Localisation'] || eq.location || '',
            'Jira ID': eq.jiraAssetId || ''
        };
    });
}

/**
 * Exporte une liste d'équipements au format Excel (.xlsx)
 */
export function exportEquipmentsToExcel(equipments: Equipment[], filename: string = 'Equipements.xlsx') {
    if (!equipments || equipments.length === 0) {
        alert("Aucun équipement à exporter.");
        return;
    }

    const data = prepareEquipmentData(equipments);
    
    // Création de la feuille de calcul
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Auto-dimensionnement des colonnes pour un bel affichage
    const colWidths = [
        { wch: 30 }, // Nom
        { wch: 20 }, // Type
        { wch: 15 }, // Marque
        { wch: 25 }, // Modèle
        { wch: 25 }, // Série
        { wch: 15 }, // Statut
        { wch: 25 }, // Utilisateur
        { wch: 15 }, // Lieu
        { wch: 15 }, // Jira ID
    ];
    worksheet['!cols'] = colWidths;

    // Création du classeur
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Parc Informatique');

    // Sauvegarde du fichier
    XLSX.writeFile(workbook, filename);
}

/**
 * Exporte une liste d'équipements au format PDF vectoriel
 */
export function exportEquipmentsToPDF(equipments: Equipment[], filename: string = 'Equipements.pdf') {
     if (!equipments || equipments.length === 0) {
        alert("Aucun équipement à exporter.");
        return;
    }

    const doc = new jsPDF({ orientation: 'landscape' });
    const data = prepareEquipmentData(equipments);

    // Titre du document
    doc.setFontSize(18);
    doc.text('Liste des Équipements - Parc Informatique', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')} | Total: ${equipments.length} équipements`, 14, 28);

    // Préparation des colonnes et lignes pour AutoTable
    const columns = Object.keys(data[0]);
    const rows = data.map(item => Object.values(item));

    // Génération du tableau riche
    autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 32,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 3,
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [39, 39, 42], // Couleur Zinc-800 pour correspondre au design du site
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252] // Gris très très clair (Slate-50)
        },
        // Si "Numéro de Série" est 'Manquant', on peut le mettre en rouge (optionnel, mais sympa)
        didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === 4 && data.cell.raw === 'Manquant') {
                data.cell.styles.textColor = [220, 38, 38]; // Text-red-600
                data.cell.styles.fontStyle = 'bold';
            }
        }
    });

    // Sauvegarde automatique du PDF
    doc.save(filename);
}
