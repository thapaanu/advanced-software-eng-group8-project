import {
  Tabs, Tab
} from "@mui/material";

export const AllTabs = ({ tabs, selectedTab, setSelectedTab }) => (
  <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)}>
    {
      tabs.map((title, index) => (
        <Tab key={index} label={title} value={index} />
      ))
    }
  </Tabs>
)
