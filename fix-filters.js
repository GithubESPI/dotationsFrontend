const fs = require('fs');
const path = 'c:/Users/SouleyLITIE/Documents/dotations/app/components/equipment/EquipmentFilters.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>`;

const injection = `
                {/* Incomplete Assets Filter */}
                <div className="md:col-span-1 flex items-end pb-1.5">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={searchParams.onlyIncomplete || false}
                                onChange={(e) => useEquipmentSearchStore.getState().setOnlyIncomplete(e.target.checked)}
                                className="sr-only"
                            />
                            <div className={\`w-10 h-5 rounded-full transition-colors duration-200 ease-in-out \${searchParams.onlyIncomplete ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-700'}\`}></div>
                            <div className={\`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out \${searchParams.onlyIncomplete ? 'translate-x-5' : 'translate-x-0'}\`}></div>
                        </div>
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors uppercase">
                            ⚠️ Données manquantes
                        </span>
                    </label>
                </div>`;

if (content.includes(target)) {
    content = content.replace(target, target + injection);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Update successful');
} else {
    console.error('Target not found');
    // Try a simpler target if the above complex one fails
    const simpleTarget = '                {/* Status Filter */}';
    if (content.includes(simpleTarget)) {
        content = content.replace(simpleTarget, injection + '\n\n' + simpleTarget);
        fs.writeFileSync(path, content, 'utf8');
        console.log('Update successful (simple target)');
    } else {
        console.error('Simple target also not found');
    }
}
