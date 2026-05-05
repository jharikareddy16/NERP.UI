import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Award, CheckCircle, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployees, useAwardCategories, useCreateRecognition } from "@/hooks/useApiData";
import { toast } from "sonner";

export default function Nominations() {
  const { user } = useAuth();
  const { data: employees = [] } = useEmployees();
  const { data: categories = [] } = useAwardCategories();
  const createMutation = useCreateRecognition();

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const isManager = user?.userRole === "manager" || user?.userRole === "admin";
  const managerCategories = categories.filter(c => c.managerOnly);
  const otherEmployees = employees.filter(e => e.id !== user?.id);

  const handleNominate = async () => {
    if (!selectedEmployee || !selectedCategory || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await createMutation.mutateAsync({
        toEmployeeId: Number(selectedEmployee),
        message: message.trim(),
        categoryId: Number(selectedCategory),
        type: "nomination",
      });
      setSent(true);
      toast.success("Nomination submitted for approval! 🏆");
      setTimeout(() => {
        setSent(false);
        setSelectedEmployee("");
        setSelectedCategory("");
        setMessage("");
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit nomination");
    }
  };

  if (!isManager) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="glass-card text-center py-16">
          <CardContent>
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Manager Access Required</h2>
            <p className="text-muted-foreground">Only managers and admins can nominate employees for award categories.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="glass-card text-center py-16">
          <CardContent>
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Nomination Submitted!</h2>
            <p className="text-muted-foreground">The nomination will be reviewed for approval.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nominate for Award</h1>
        <p className="text-muted-foreground mt-1">Recognize outstanding employees with formal nominations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {managerCategories.map(cat => (
          <Card key={cat.id} className={`glass-card cursor-pointer transition-all ${selectedCategory === String(cat.id) ? "ring-2 ring-primary" : "hover:border-primary/30"}`} onClick={() => setSelectedCategory(String(cat.id))}>
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <p className="font-semibold text-sm">{cat.name}</p>
                <p className="text-xs text-muted-foreground">{cat.description}</p>
                <Badge variant="secondary" className="mt-1 text-xs">+{cat.points} pts</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardContent className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium mb-2 block">Nominate Employee</label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger><SelectValue placeholder="Select an employee" /></SelectTrigger>
              <SelectContent>
                {otherEmployees.map(emp => (
                  <SelectItem key={emp.id} value={String(emp.id)}>
                    <span className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{emp.avatar}</AvatarFallback>
                      </Avatar>
                      {emp.name} · {emp.role}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Award Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger><SelectValue placeholder="Select award category" /></SelectTrigger>
              <SelectContent>
                {managerCategories.map(cat => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.icon} {cat.name} (+{cat.points} pts)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Nomination Reason</label>
            <Textarea placeholder="Explain why this employee deserves this award..." value={message} onChange={e => setMessage(e.target.value)} rows={4} className="resize-none" />
          </div>

          <Button onClick={handleNominate} className="w-full gradient-gold text-gold-foreground font-semibold" size="lg" disabled={createMutation.isPending}>
            <Award className="w-4 h-4 mr-2" /> {createMutation.isPending ? "Submitting..." : "Submit Nomination"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
