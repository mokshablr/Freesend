import * as React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface CodeTabsProps {
  children: React.ReactNode;
  defaultTab?: string;
}

interface CodeTabProps {
  label: string;
  children: React.ReactNode;
  value?: string;
}

function CodeTabs({ children, defaultTab }: CodeTabsProps) {
  // Extract tab labels and content
  const tabs = React.Children.toArray(children).filter(Boolean) as React.ReactElement<CodeTabProps>[];
  const firstTab = tabs[0]?.props.label || "Tab1";
  return (
    <Tabs defaultValue={defaultTab || firstTab} className="w-full mt-4">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.props.label} value={tab.props.label}>
            {tab.props.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.props.label} value={tab.props.label}>
          {tab.props.children}
        </TabsContent>
      ))}
    </Tabs>
  );
}

CodeTabs.Tab = function CodeTab({ children }: CodeTabProps) {
  return <>{children}</>;
};

export { CodeTabs }; 