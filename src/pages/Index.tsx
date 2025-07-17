import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { CallsTable } from "@/components/calls/CallsTable";
import { BillingManager } from "@/components/billing/BillingManager";

interface CallData {
  [key: string]: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [callData, setCallData] = useState<CallData[]>([]);

  const handleFileProcessed = (data: CallData[]) => {
    setCallData(data);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "calls":
        return <CallsTable data={callData} />;
      case "billing":
        return <BillingManager data={callData} />;
      default:
        return <Dashboard data={callData} onFileProcessed={handleFileProcessed} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-6 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
