import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Send, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmployees, useAwardCategories, useCreateRecognition } from "@/hooks/useApiData";
import { toast } from "sonner";

export default function SendAppreciation() {
  const { user } = useAuth();
  const { data: employees = [] } = useEmployees();
  const { data: categories = [] } = useAwardCategories();
  const createMutation = useCreateRecognition();

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const availableCategories = categories.filter(c => !c.managerOnly);
  const otherEmployees = employees.filter(e => e.id !== user?.id);

  const handleSend = async () => {
    if (!selectedEmployee || !message.trim()) {
      toast.error("Please select a colleague and write a message");
      return;
    }
    try {
      await createMutation.mutateAsync({
        toEmployeeId: Number(selectedEmployee),
        message: message.trim(),
        categoryId: selectedCategory ? Number(selectedCategory) : undefined,
        type: "appreciation",
      });
      setSent(true);
      toast.success("Appreciation sent successfully! 🎉");
      setTimeout(() => {
        setSent(false);
        setSelectedEmployee("");
        setSelectedCategory("");
        setMessage("");
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to send appreciation");
    }
  };

  if (sent) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="glass-card text-center py-16">
          <CardContent>
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Appreciation Sent!</h2>
            <p className="text-muted-foreground">Your colleague will be notified of your recognition.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Send Appreciation</h1>
        <p className="text-muted-foreground mt-1">Recognize a colleague's great work</p>
      </div>

      <Card className="glass-card">
        <CardContent className="p-6 space-y-5">
          <div>
            <label className="text-sm font-medium mb-2 block">Who would you like to appreciate?</label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger><SelectValue placeholder="Select a colleague" /></SelectTrigger>
              <SelectContent>
                {otherEmployees.map(emp => (
                  <SelectItem key={emp.id} value={String(emp.id)}>
                    <span className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{emp.avatar}</AvatarFallback>
                      </Avatar>
                      {emp.name} · {emp.department}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Category (optional)</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
              <SelectContent>
                {availableCategories.map(cat => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    <span className="flex items-center gap-2">
                      {cat.icon} {cat.name}
                      {/* <Badge variant="outline" className="ml-auto text-xs">+{cat.points} pts</Badge> */}
                      {cat.managerOnly && (
                      <Badge variant="outline" className="ml-auto text-xs">
                      +{cat.points} pts
                      </Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Your message</label>
            <Textarea placeholder="Tell them why their work matters..." value={message} onChange={e => setMessage(e.target.value)} rows={6} className="resize-none" />
          </div>

          <Button onClick={handleSend} className="w-full gradient-primary text-primary-foreground" size="lg" disabled={createMutation.isPending}>
            <Heart className="w-4 h-4 mr-2" /> {createMutation.isPending ? "Sending..." : "Send Appreciation"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
