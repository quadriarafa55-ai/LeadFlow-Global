import React, { useState } from 'react';
import { Globe2, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { globalCountriesData, CountryData } from '../data/countries';

export interface CountrySelection {
  countryName: string;
  flag: string;
  allStates: boolean;
  selectedStates: string[];
}

interface CountryStateSelectorProps {
  selectedCountries: CountrySelection[];
  onChange: (selection: CountrySelection[]) => void;
}

export const CountryStateSelector: React.FC<CountryStateSelectorProps> = ({
  selectedCountries,
  onChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCountry, setExpandedCountry] = useState<string | null>(globalCountriesData[0].country);

  // Filter countries by name, native name, ISO code, region, or matching states
  const filteredLocations = globalCountriesData.filter(loc => {
    const q = searchQuery.toLowerCase();
    const matchesCountry = loc.country.toLowerCase().includes(q) ||
                           loc.nativeName.toLowerCase().includes(q) ||
                           loc.iso.toLowerCase().includes(q) ||
                           loc.region.toLowerCase().includes(q);
    const matchesState = loc.states.some(s => s.toLowerCase().includes(q));
    return matchesCountry || matchesState;
  });

  const isAllCountriesSelected = globalCountriesData.every(loc => 
    selectedCountries.some(sc => sc.countryName === loc.country)
  );

  const totalStatesSelectedCount = selectedCountries.reduce((acc, sc) => acc + sc.selectedStates.length, 0);

  const handleToggleSelectAllCountries = () => {
    if (isAllCountriesSelected) {
      onChange([]);
    } else {
      const all: CountrySelection[] = globalCountriesData.map(loc => ({
        countryName: loc.country,
        flag: loc.flag,
        allStates: true,
        selectedStates: [...loc.states]
      }));
      onChange(all);
    }
  };

  const handleToggleCountry = (loc: CountryData) => {
    const existing = selectedCountries.find(sc => sc.countryName === loc.country);
    if (existing) {
      onChange(selectedCountries.filter(sc => sc.countryName !== loc.country));
    } else {
      const added: CountrySelection = {
        countryName: loc.country,
        flag: loc.flag,
        allStates: true,
        selectedStates: [...loc.states]
      };
      onChange([...selectedCountries, added]);
      setExpandedCountry(loc.country);
    }
  };

  const handleToggleState = (countryName: string, stateName: string, allStatesList: string[]) => {
    onChange(selectedCountries.map(sc => {
      if (sc.countryName === countryName) {
        let nextStates = [...sc.selectedStates];
        if (stateName === "All States (Nationwide)") {
          const isCurrentlyAll = sc.selectedStates.length === allStatesList.length;
          return {
            ...sc,
            allStates: !isCurrentlyAll,
            selectedStates: !isCurrentlyAll ? [...allStatesList] : []
          };
        } else {
          if (nextStates.includes(stateName)) {
            nextStates = nextStates.filter(s => s !== stateName && s !== "All States (Nationwide)");
          } else {
            nextStates.push(stateName);
          }
          return {
            ...sc,
            selectedStates: nextStates,
            allStates: nextStates.length === allStatesList.length
          };
        }
      }
      return sc;
    }));
  };

  return (
    <div className="space-y-4">
      {/* Master Controls & Live Search */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={isAllCountriesSelected}
              onChange={handleToggleSelectAllCountries}
              className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Select All 195+ World Countries ({globalCountriesData.length})</span>
          </label>

          <span className="text-[11px] bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full font-mono border border-cyan-500/25">
            Targeting: {selectedCountries.length} countries ({totalStatesSelectedCount} regions)
          </span>
        </div>

        {/* Live Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 195+ countries, ISO codes, native names, or any region worldwide..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner"
          />
        </div>
      </div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
        {filteredLocations.length > 0 ? (
          filteredLocations.map((loc) => {
            const selection = selectedCountries.find(sc => sc.countryName === loc.country);
            const isChecked = !!selection;
            const isExpanded = expandedCountry === loc.country;

            return (
              <div 
                key={loc.iso}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isChecked 
                    ? 'bg-slate-900/95 border-cyan-500/50 shadow-lg shadow-cyan-500/10' 
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleCountry(loc)}
                      className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xl">{loc.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{loc.country}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                          {loc.iso} • {loc.region}
                        </span>
                      </div>
                      <span className="block text-[10px] text-slate-400 mt-0.5">
                        {isChecked ? `${selection.selectedStates.length} / ${loc.states.length} regions selected` : `${loc.states.length} regions available`}
                      </span>
                    </div>
                  </div>

                  {isChecked && (
                    <button
                      type="button"
                      onClick={() => setExpandedCountry(isExpanded ? null : loc.country)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                    >
                      <span>Regions</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* State Sub-Selector Drawer */}
                {isChecked && isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-950/80 space-y-2.5 animate-in fade-in duration-200">
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {loc.states.map((st) => {
                        const isStChecked = selection.selectedStates.includes(st);
                        const isHighlighted = searchQuery.trim() && st.toLowerCase().includes(searchQuery.toLowerCase());
                        return (
                          <label 
                            key={`${loc.iso}-${st}`}
                            className={`flex items-center gap-2 cursor-pointer select-none text-[11px] px-2.5 py-1.5 rounded-lg transition-colors ${
                              st === "All States (Nationwide)" ? 'col-span-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold' :
                              isHighlighted ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold' : 'text-slate-300 hover:bg-slate-900'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={isStChecked}
                              onChange={() => handleToggleState(loc.country, st, loc.states)}
                              className="w-3 h-3 rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer shrink-0"
                            />
                            <span className="truncate">{st}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-2 py-12 text-center text-slate-500 text-xs">
            No countries or states found matching "{searchQuery}". Try another search term.
          </div>
        )}
      </div>
    </div>
  );
};
