const fs = require('fs');
const path = 'c:/Users/SouleyLITIE/Documents/dotations/app/equipment/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `{equipment.jiraAttributes?.['Name'] && (
                        <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                          <span className="font-medium">Nom:</span>
                          <span>{equipment.jiraAttributes['Name']}</span>
                        </div>
                      )}`;

const injection = `
                      {/* Alerte si données manquantes */}
                      {equipment.isMissingSerialNumber && (
                        <div className="mt-2 flex items-center gap-2 px-2 py-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span className="text-[10px] font-bold uppercase tracking-tight">Série manquant</span>
                        </div>
                      )}`;

if (content.includes(target)) {
    content = content.replace(target, target + injection);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Update successful');
} else {
    console.error('Target not found');
}
