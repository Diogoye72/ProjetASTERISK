import { Phone, BarChart3, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'calls', label: 'Appels', icon: Phone },
    { id: 'billing', label: 'Facturation', icon: DollarSign },
  ];

  return (
    <header className="bg-gradient-primary shadow-soft border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Asterisk Analytics
              </h1>
              <p className="text-primary-foreground/80 text-sm">
                Statistiques et facturation d'appels
              </p>
            </div>
          </div>
          
          <nav className="flex space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(tab.id)}
                  className={`
                    ${activeTab === tab.id 
                      ? 'bg-white/20 text-white shadow-soft' 
                      : 'text-primary-foreground/80 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}