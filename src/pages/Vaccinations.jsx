import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Syringe,
  Loader2,
  CheckCircle2,
  Trash2,
  Filter,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { PageTransition } from "@/components/PageTransition";
import { toast } from "react-toastify";
import api from "@/services/api";

const statusLabels = {
  completed: "Completed",
  "up-to-date": "Up To Date",
  "coming-soon": "Coming Soon",
  overdue: "Overdue",
  "due-today": "Due Today",
  info: "No Due Date",
};

const statusColors = {
  completed:
    "bg-green-500/15 text-green-700 border border-green-500/30",
  "up-to-date":
    "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
  "coming-soon":
    "bg-amber-500/15 text-amber-600 border border-amber-500/30",
  overdue:
    "bg-red-500/15 text-red-600 border border-red-500/30",
  "due-today":
    "bg-blue-500/15 text-blue-600 border border-blue-500/30",
  info:
    "bg-gray-500/15 text-gray-600 border border-gray-500/30",
};

export default function VaccinationsPage() {
  const [vaccinations, setVaccinations] = useState([]);
  const [pets, setPets] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vaxRes, petRes] = await Promise.all([
        api.get("/vaccinations"),
        api.get("/pets"),
      ]);

      setVaccinations(vaxRes.data);
      setPets(petRes.data);
    } catch (error) {
      console.log("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (dueDate, completed) => {
    if (completed) return "completed";
    if (!dueDate) return "info";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (due < today) return "overdue";

    const diff = (due - today) / (1000 * 60 * 60 * 24);

    if (diff === 0) return "due-today";
    if (diff <= 7) return "coming-soon";

    return "up-to-date";
  };

  const filteredVaccinations = useMemo(() => {
    return vaccinations.filter((v) => {
      const status = getStatus(v.next_due_date, v.completed);

      if (filter === "all") return true;
      if (filter === "completed") return v.completed;
      if (filter === "pending") return !v.completed;
      if (filter === "overdue") return status === "overdue";

      return true;
    });
  }, [vaccinations, filter]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    try {
      setCreating(true);

      const res = await api.post("/vaccinations", {
        pet_id: fd.get("pet_id"),
        vaccine_name: fd.get("vaccine_name"),
        given_date: fd.get("given_date"),
        next_due_date: fd.get("next_due_date"),
        reminder_sent: false,
        completed: false,
      });

      setVaccinations((prev) => [
        res.data.vaccination,
        ...prev,
      ]);

      toast.success("Vaccination added");
      setOpen(false);
      e.currentTarget.reset();
    } catch (error) {
      console.log("Failed to add vaccination",error);
    } finally {
      setCreating(false);
    }
  };

  const handleMarkCompleted = async (id) => {
    try {
      const res = await api.put(`/vaccinations/${id}`, {
        completed: true,
      });

      setVaccinations((prev) =>
        prev.map((v) =>
          v.id === id ? res.data.vaccination : v
        )
      );

      toast.success("Marked as completed");
    } catch (error) {
      console.log("Failed to update");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/vaccinations/${id}`);

      setVaccinations((prev) =>
        prev.filter((v) => v.id !== id)
      );

      toast.success("Deleted successfully");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div>Loading vaccinations...</div>;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold">Vaccinations</h1>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Add Vaccination
              </Button>
            </DialogTrigger>

            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add Vaccination</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Pet</Label>
                  <Select name="pet_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {pets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Vaccine Name</Label>
                  <Input name="vaccine_name" required />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Date Given</Label>
                    <Input
                      name="given_date"
                      type="date"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Next Due</Label>
                    <Input
                      name="next_due_date"
                      type="date"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={creating}
                >
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {creating ? "Saving..." : "Save"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {["all", "pending", "completed", "overdue"].map(
            (f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
              >
                <Filter className="mr-1 h-3 w-3" />
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            )
          )}
        </div>

        {/* List */}
        <div className="space-y-3">
          {filteredVaccinations.map((v) => {
            const status = getStatus(
              v.next_due_date,
              v.completed
            );

            return (
              <Card key={v.id} className="rounded-2xl">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Syringe className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold">
                      {v.vaccine_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Pet: {v.pets?.name} · Given:{" "}
                      {v.given_date} · Due:{" "}
                      {v.next_due_date || "N/A"}
                    </p>
                  </div>

                  <Badge
                    className={`text-xs ${statusColors[status]}`}
                  >
                    {statusLabels[status]}
                  </Badge>

                  {!v.completed && (
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        handleMarkCompleted(v.id)
                      }
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </Button>
                  )}

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleDelete(v.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}