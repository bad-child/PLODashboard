import re

filepath = r'c:\Users\prayo\.gemini\antigravity-ide\scratch\plo-dashboard-monitoring\resources\js\Components\Dashboard.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update component props to include selectedSite
# Matches things like `({ filterType, ..., selectedFundCenter }) => {`
content = re.sub(
    r'(selectedFundCenter)(\s*}\s*=>\s*\{)',
    r'\1, selectedSite\2',
    content
)

# 2. Update params objects to include site
# Matches `fund_center: selectedFundCenter,`
content = re.sub(
    r'(fund_center:\s*selectedFundCenter,?)',
    r'\1\n                        site: selectedSite,',
    content
)

# 3. Update useEffect dependencies
# Matches `selectedFundCenter]`
content = re.sub(
    r'(selectedFundCenter)(\s*\])',
    r'\1, selectedSite\2',
    content
)

# 4. Add the new state variables and API calls to Dashboard component
# Find the start of Dashboard component
dashboard_start = content.find("const [commitmentItems, setCommitmentItems] = useState([]);")
if dashboard_start != -1:
    new_state = """const [commitmentItems, setCommitmentItems] = useState([]);
    const [sites, setSites] = useState([]);
    const [selectedSite, setSelectedSite] = useState('');"""
    content = content.replace("const [commitmentItems, setCommitmentItems] = useState([]);", new_state)

fetch_items_start = content.find("const sResponse = await axios.get(route('api.dashboard.sites'));")
if fetch_items_start == -1: # if not already added
    old_fetch_fc = """            try {
                const fcResponse = await axios.get(route('api.dashboard.fund_centers'));"""
    new_fetch_fc = """            try {
                const sResponse = await axios.get(route('api.dashboard.sites'));
                setSites(sResponse.data);
            } catch (err) {
                console.error("Failed to load sites", err);
            }
            try {
                const fcResponse = await axios.get(route('api.dashboard.fund_centers'));"""
    content = content.replace(old_fetch_fc, new_fetch_fc)

# 5. Add the Site SearchableSelect
old_filter = """                            {/* Fund Center Filter */}
                            <SearchableSelect
                                items={fundCenters}"""
new_filter = """                            {/* Site Filter */}
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
                                minWidth="100px"
                                maxWidth="150px"
                                displayLabelOnly={true}
                            />

                            {/* Fund Center Filter */}
                            <SearchableSelect
                                items={selectedSite ? fundCenters.filter(fc => fc.Site === selectedSite) : fundCenters}"""
content = content.replace(old_filter, new_filter)

# 6. Make sure all component usages get selectedSite={selectedSite}
# E.g. <MonthlyTrendChart ... selectedFundCenter={selectedFundCenter} />
content = re.sub(
    r'(selectedFundCenter={selectedFundCenter})',
    r'\1 selectedSite={selectedSite}',
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Dashboard.jsx updated successfully!")
