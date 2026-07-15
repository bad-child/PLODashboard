const fs = require('fs');

const filepath = 'c:\\Users\\prayo\\.gemini\\antigravity-ide\\scratch\\plo-dashboard-monitoring\\resources\\js\\Components\\Dashboard.jsx';
let content = fs.readFileSync(filepath, 'utf-8');

// Normalize line endings to simplify replacement
content = content.replace(/\r\n/g, '\n');

// 1. Fix the ReferenceError in component props
const components = [
    'MonthlyTrendChart',
    'NominalChart',
    'CostCompositionChart',
    'TopVariancesList',
];

for (const comp of components) {
    const regex = new RegExp(`(const ${comp} = \\(\\{.*?selectedFundCenter)( \\}\\) => \\{)`);
    content = content.replace(regex, '$1, selectedSite$2');
}

// Check VarianceDetails
content = content.replace(/(const VarianceDetails = \(\{[^\}]*?)( \}\) => \{)/, (match, p1, p2) => {
    if (!p1.includes('selectedSite')) {
        return p1 + ', selectedSite' + p2;
    }
    return match;
});
content = content.replace(/(site:\s*selectedSite,)/g, ''); // remove previous bad inserts of site: selectedSite in params to avoid duplicates
content = content.replace(/(fund_center:\s*selectedFundCenter,)/g, '$1\n            site: selectedSite,');

// 2. Fix useEffect dependencies for the components
content = content.replace(/(selectedFundCenter)(\s*\]\);)/g, (match, p1, p2) => {
    return p1 + ', selectedSite' + p2;
});

// 3. Fix the site fetching (which was missed earlier)
const oldFetch = `            try {
                const fcResponse = await axios.get(route('api.dashboard.fund_centers'));`;
const newFetch = `            try {
                const sResponse = await axios.get(route('api.dashboard.sites'));
                setSites(sResponse.data);
            } catch (err) {
                console.error("Failed to load sites", err);
            }
            try {
                const fcResponse = await axios.get(route('api.dashboard.fund_centers'));`;

if (!content.includes('api.dashboard.sites')) {
    content = content.replace(oldFetch, newFetch);
}

// 4. Fix the SearchableSelect UI
const oldSelect = `                            {/* Fund Center Filter */}
                            <SearchableSelect
                                items={fundCenters}`;
const newSelect = `                            {/* Site Filter */}
                            <SearchableSelect
                                items={sites}
                                value={selectedSite}
                                onChange={(val) => {
                                    setSelectedSite(val);
                                    if (val !== selectedSite) setSelectedFundCenter('');
                                }}
                                placeholder="-- Pilih Site --"
                                valueKey="Site"
                                labelKey="Site"
                                minWidth="150px"
                                maxWidth="250px"
                                displayLabelOnly={true}
                            />

                            {/* Fund Center Filter */}
                            <SearchableSelect
                                items={selectedSite ? fundCenters.filter(fc => fc.Site === selectedSite) : fundCenters}`;

if (!content.includes('{/* Site Filter */}')) {
    content = content.replace(oldSelect, newSelect);
}

// 5. Pass selectedSite to all usages of selectedFundCenter={selectedFundCenter}
content = content.replace(/(selectedFundCenter={selectedFundCenter})/g, (match) => {
    return match + ' selectedSite={selectedSite}';
});
// Deduplicate just in case
content = content.replace(/selectedSite={selectedSite} selectedSite={selectedSite}/g, 'selectedSite={selectedSite}');
content = content.replace(/,\s*selectedSite,\s*selectedSite\s*\]/g, ', selectedSite]');
content = content.replace(/site:\s*selectedSite,\s*site:\s*selectedSite,/g, 'site: selectedSite,');
content = content.replace(/selectedSite,\s*selectedSite/g, 'selectedSite');

fs.writeFileSync(filepath, content);
console.log("Fixed!");
