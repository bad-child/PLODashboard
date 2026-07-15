<?php
$filepath = __DIR__ . '/resources/js/Components/Dashboard.jsx';
$content = file_get_contents($filepath);

// 1. Update component props to include selectedSite
$content = preg_replace(
    '/(selectedFundCenter)(\s*}\s*=>\s*\{)/',
    '$1, selectedSite$2',
    $content
);

// 2. Update params objects to include site
$content = preg_replace(
    '/(fund_center:\s*selectedFundCenter,?)/',
    "$1\n                        site: selectedSite,",
    $content
);

// 3. Update useEffect dependencies
$content = preg_replace(
    '/(selectedFundCenter)(\s*\])/',
    '$1, selectedSite$2',
    $content
);

// 4. Add the new state variables
$old_state = "const [commitmentItems, setCommitmentItems] = useState([]);";
$new_state = "const [commitmentItems, setCommitmentItems] = useState([]);\n    const [sites, setSites] = useState([]);\n    const [selectedSite, setSelectedSite] = useState('');";
$content = str_replace($old_state, $new_state, $content);

// 4b. Add API call for sites
$old_fetch_fc = "            try {\n                const fcResponse = await axios.get(route('api.dashboard.fund_centers'));";
$new_fetch_fc = "            try {\n                const sResponse = await axios.get(route('api.dashboard.sites'));\n                setSites(sResponse.data);\n            } catch (err) {\n                console.error(\"Failed to load sites\", err);\n            }\n            try {\n                const fcResponse = await axios.get(route('api.dashboard.fund_centers'));";
$content = str_replace($old_fetch_fc, $new_fetch_fc, $content);

// 5. Add the Site SearchableSelect
$old_filter = "                            {/* Fund Center Filter */}\n                            <SearchableSelect\n                                items={fundCenters}";
$new_filter = "                            {/* Site Filter */}\n                            <SearchableSelect\n                                items={sites}\n                                value={selectedSite}\n                                onChange={(val) => {\n                                    setSelectedSite(val);\n                                    if (val !== selectedSite) setSelectedFundCenter('');\n                                }}\n                                placeholder=\"-- Pilih Site --\"\n                                valueKey=\"Site\"\n                                labelKey=\"Site\"\n                                minWidth=\"100px\"\n                                maxWidth=\"150px\"\n                                displayLabelOnly={true}\n                            />\n\n                            {/* Fund Center Filter */}\n                            <SearchableSelect\n                                items={selectedSite ? fundCenters.filter(fc => fc.Site === selectedSite) : fundCenters}";
$content = str_replace($old_filter, $new_filter, $content);

// 6. Make sure all component usages get selectedSite={selectedSite}
$content = preg_replace(
    '/(selectedFundCenter={selectedFundCenter})/',
    '$1 selectedSite={selectedSite}',
    $content
);

file_put_contents($filepath, $content);
echo "Dashboard.jsx updated successfully!\n";
