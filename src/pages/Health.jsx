import { useEffect, useState } from "react";
import api from "../services/api";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function HealthPage() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [logs, setLogs] = useState([]);
  const [weightTrend, setWeightTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [updating, setUpdating] = useState(false);

  // ---------------- Fetch Pets ----------------
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await api.get("/pets");
        const petsData = res.data || [];
        setPets(petsData);
        if (petsData.length > 0) setSelectedPet(petsData[0]);
      } catch {
        toast.error("Failed to load pets");
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
  }, []);

  // ---------------- Fetch Health Logs & Weight Trend ----------------
  useEffect(() => {
    if (!selectedPet) return;
    const fetchData = async () => {
      try {
        const [logsRes, trendRes] = await Promise.all([
          api.get(`/health/pet/${selectedPet.id}`),
          api.get(`/health/weight/${selectedPet.id}`),
        ]);

        const sortedTrend = (trendRes.data.weightTrend || []).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        setLogs(logsRes.data || []);
        setWeightTrend(sortedTrend);
      } catch {
        toast.error("Failed to load pet health data");
      }
    };
    fetchData();
  }, [selectedPet]);

  // ---------------- Add Health Log ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      pet_id: selectedPet.id,
      date: fd.get("date"),
      weight: Number(fd.get("weight")),
      temperature: Number(fd.get("temperature")),
      notes: fd.get("notes"),
      symptoms: "",
    };

    try {
      setSaving(true);
      const res = await api.post("/health", payload);

      setLogs((prev) => [res.data, ...prev]);
      setWeightTrend((prev) => {
        const filtered = prev.filter((p) => p.date !== res.data.date);
        return [...filtered, { date: res.data.date, weight: res.data.weight }].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
      });

      toast.success("Health log added!");
      setOpen(false);
      e.currentTarget.reset();
    } catch {
      console.log("Failed to add health log");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- Delete Health Log ----------------
  const handleDelete = async (id) => {
    try {
      const deletedLog = logs.find((l) => l.id === id);
      await api.delete(`/health/${id}`);

      setLogs((prev) => prev.filter((l) => l.id !== id));
      if (deletedLog?.weight) setWeightTrend((prev) => prev.filter((p) => p.date !== deletedLog.date));

      toast.success("Health log deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // ---------------- Edit Health Log ----------------
  const handleEdit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const updated = {
      weight: Number(fd.get("weight")),
      temperature: Number(fd.get("temperature")),
      notes: fd.get("notes"),
    };

    try {
      setUpdating(true);
      const res = await api.put(`/health/${editingLog.id}`, updated);

      setLogs((prev) => prev.map((l) => (l.id === editingLog.id ? res.data : l)));
      setWeightTrend((prev) =>
        prev.map((p) => (p.date === editingLog.date ? { ...p, weight: res.data.weight } : p))
      );

      setEditingLog(null);
      toast.success("Health log updated!");
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-6">Loading pet data...</div>;
  if (pets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="text-5xl mb-4">🐾</div>
        <h2 className="text-xl font-semibold mb-2">
          No Pets Added Yet
        </h2>
        <p className="text-muted-foreground max-w-sm">
          Add your furry friend first to start tracking their health journey 💚
        </p>
      </div>
    );
  }

  const chartData = weightTrend.map((item) => ({ date: item.date.slice(5), weight: item.weight }));

  return (
    <div className="space-y-6 px-2 sm:px-4 md:px-6">
      {/* Title + Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold">Health</h1>
        {selectedPet && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
                <Plus className="h-4 w-4" /> Add Health Log
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add Health Log – {selectedPet.name}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="date" type="date" required />
                <Input name="weight" type="number" step="0.1" placeholder="Weight (kg)" required />
                <Input name="temperature" type="number" step="0.1" placeholder="Temperature (°C)" required />
                <Textarea name="notes" placeholder="Notes" />
                <Button type="submit" disabled={saving} className="w-full">
                  {saving ? "Saving..." : "Save Log"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Pet Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {pets.map((pet) => (
          <Button
            key={pet.id}
            variant={selectedPet?.id === pet.id ? "default" : "outline"}
            className="rounded-xl flex-shrink-0"
            onClick={() => setSelectedPet(pet)}
          >
            {pet.name}
          </Button>
        ))}
      </div>

      {/* Health Logs Table */}
      {selectedPet && (
        <Card className="w-full overflow-x-auto">
          <CardHeader>
            <CardTitle>Health Logs – {selectedPet.name}</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4">
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-muted/10">
                  <th className="px-2 py-1 text-left text-sm">Date</th>
                  <th className="px-2 py-1 text-left text-sm">Weight</th>
                  <th className="px-2 py-1 text-left text-sm">Temp</th>
                  <th className="px-2 py-1 text-left text-sm">Notes</th>
                  <th className="px-2 py-1 text-right text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-muted-foreground">
                      No health logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-2 py-1">{log.date}</td>
                      <td className="px-2 py-1">{log.weight}</td>
                      <td className="px-2 py-1">{log.temperature}</td>
                      <td className="px-2 py-1">{log.notes}</td>
                      <td className="px-2 py-1 text-right space-x-1">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setEditingLog(log)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="destructive" onClick={() => handleDelete(log.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Weight Trend */}
      {selectedPet && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Weight Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72 sm:h-80">
            {weightTrend.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No health records yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#16a34a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Health Log Dialog */}
      {editingLog && (
        <Dialog open={true} onOpenChange={() => setEditingLog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Health Log</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <Input name="weight" type="number" step="0.1" defaultValue={editingLog.weight} required />
              <Input name="temperature" type="number" step="0.1" defaultValue={editingLog.temperature} required />
              <Textarea name="notes" defaultValue={editingLog.notes} />
              <Button type="submit" disabled={updating} className="w-full">
                {updating ? "Updating..." : "Update Log"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}