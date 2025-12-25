import { AppLayout } from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Moon, Sun, Monitor, Download, Upload, Coins } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCurrency, Currency } from "@/context/CurrencyContext";
import { useBudget } from "@/context/BudgetContext";
import { usePreferences } from "@/context/PreferencesContext";
import { PiggyBank, LayoutDashboard } from "lucide-react";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { monthlyBudget, setMonthlyBudget } = useBudget();
  const { showTrendChart, setShowTrendChart } = usePreferences();

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl mx-auto pb-10">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your preferences and data
          </p>
        </div>

        <div className="space-y-6">
          {/* Appearance Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" /> Appearance
              </CardTitle>
              <CardDescription>
                Customize how SpendWise looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme-mode" className="flex flex-col gap-1">
                  <span>Theme Mode</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Select your preferred theme
                  </span>
                </Label>
                <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg">
                  <Button
                    variant={theme === "light" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setTheme("system")}
                  >
                    <Monitor className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Currency Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5" /> Currency
              </CardTitle>
              <CardDescription>
                Set your preferred currency for display.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Currency Symbol</Label>
                  <div className="text-sm text-muted-foreground">
                    Select how amounts are displayed
                  </div>
                </div>
                <Select
                  value={currency}
                  onValueChange={(v) => setCurrency(v as Currency)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Budget Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" /> Monthly Budget
              </CardTitle>
              <CardDescription>
                Set a spending limit for the month.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5 flex-1">
                  <Label>Budget Amount</Label>
                  <div className="text-sm text-muted-foreground">
                    Enter 0 to disable budget tracking
                  </div>
                </div>
                <div className="w-[180px]">
                  <Input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Settings Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" /> Dashboard
              </CardTitle>
              <CardDescription>
                Customize your dashboard layout.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="trend-chart-toggle">
                    Show Spending Trend
                  </Label>
                  <div className="text-sm text-muted-foreground">
                    Display daily spending trend chart
                  </div>
                </div>
                <Switch
                  id="trend-chart-toggle"
                  checked={showTrendChart}
                  onCheckedChange={setShowTrendChart}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" /> Data Management
              </CardTitle>
              <CardDescription>
                Export or import your expenses data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Export Data</Label>
                    <p className="text-xs text-muted-foreground">
                      Download all your expenses as a JSON file.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      const data = localStorage.getItem(
                        "spendwise_local_expenses"
                      );
                      if (!data) {
                        alert("No data to export");
                        return;
                      }
                      const blob = new Blob([data], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `spendwise_backup_${
                        new Date().toISOString().split("T")[0]
                      }.json`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-4 w-4" /> Export
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Import Data</Label>
                    <p className="text-xs text-muted-foreground">
                      Restore your expenses from a backup file.
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const content = event.target?.result as string;
                            const parsed = JSON.parse(content);
                            if (Array.isArray(parsed)) {
                              localStorage.setItem(
                                "spendwise_local_expenses",
                                JSON.stringify(parsed)
                              );
                              window.location.reload();
                            } else {
                              alert("Invalid file format");
                            }
                          } catch (err) {
                            alert("Failed to parse file");
                          }
                        };
                        reader.readAsText(file);
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 pointer-events-none"
                    >
                      <Upload className="h-4 w-4" /> Import
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
