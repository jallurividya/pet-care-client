import { useEffect, useState } from "react";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { toast } from "react-toastify";

export default function Expenses() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    description: "",
    date: "",
  });

  // Fetch pets
  const fetchPets = async () => {
    const res = await api.get("/pets");
    setPets(res.data);
    if (res.data.length > 0) {
      setSelectedPet(res.data[0].id);
    }
    setLoading(false)
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    const res = await api.get("/expenses");
    setExpenses(res.data);
  };

  useEffect(() => {
    fetchPets();
    fetchExpenses();
  }, []);

  const filteredExpenses = expenses.filter(
    (exp) => exp.pet_id === selectedPet
  );

  const totalAmount = filteredExpenses.reduce(
    (sum, exp) => sum + Number(exp.amount),
    0
  );

  const handleAddExpense = async () => {
    try {
      await api.post("/expenses", {
        pet_id: selectedPet,
        ...formData,
      });

      setOpen(false);
      setFormData({
        category: "",
        amount: "",
        description: "",
        date: "",
      });
      toast.success("Expense added!")
      fetchExpenses();
    } catch (err) {
      toast.error("Failed to add expense")
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/expenses/${id}`);
    toast.success("Delete Successful")
    fetchExpenses();
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "food":
        return "bg-green-100 text-green-700";
      case "medical":
        return "bg-red-100 text-red-700";
      case "grooming":
        return "bg-blue-100 text-blue-700";
      case "insurance":
        return "bg-purple-100 text-purple-700";
      default:
        return "";
    }
  };
  if (loading) {
    return <div className="p-6">Loading expenses...</div>;
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Expenses</h2>

        <Button onClick={() => setOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* 🐶 Pet Tabs */}
      <div className="flex gap-3 flex-wrap">
        {pets.map((pet) => (
          <Button
            key={pet.id}
            variant={selectedPet === pet.id ? "default" : "outline"}
            onClick={() => setSelectedPet(pet.id)}
            className={
              selectedPet === pet.id
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : ""
            }
          >
            {pet.name}
          </Button>
        ))}
      </div>

      {/* Total Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Total Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">₹ {totalAmount.toFixed(2)}</p>
        </CardContent>
      </Card>

      {/* Expenses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExpenses.map((exp) => (
          <Card key={exp.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <Badge className={getCategoryColor(exp.category)}>
                  {exp.category}
                </Badge>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(exp.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              <h3 className="text-xl font-semibold">
                ₹ {Number(exp.amount).toFixed(2)}
              </h3>

              <p className="text-sm text-muted-foreground">
                {exp.description}
              </p>

              <p className="text-xs text-muted-foreground">
                {exp.date}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="grooming">Grooming</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleAddExpense}
            >
              Save Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}