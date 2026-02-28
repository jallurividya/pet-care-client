import { useEffect, useState } from "react";
import api from "../api/api";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "react-toastify";

export default function HealthPage() {
    const [pets, setPets] = useState([]);
    const [selectedPet, setSelectedPet] = useState(null);
    const [logs, setLogs] = useState([]);
    const [weightTrend, setWeightTrend] = useState([]);
    const [mealPlan, setMealPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [updating, setUpdating] = useState(false);

    // Fetch pets
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

    // Fetch logs, weight trend, and meal plan
    useEffect(() => {
        if (!selectedPet) return;

        const fetchData = async () => {
            try {
                // Health logs
                const logsRes = await api.get(`/health/pet/${selectedPet.id}`);
                setLogs(logsRes.data || []);

                // Weight trend
                const trendRes = await api.get(`/health/weight/${selectedPet.id}`);
                const sortedTrend = (trendRes.data.weightTrend || []).sort(
                    (a, b) => new Date(a.date) - new Date(b.date)
                );
                setWeightTrend(sortedTrend);

                // Nutrition / meal plan
                const mealRes = await api.get(`/nutrition/${selectedPet.id}`);
                setMealPlan(mealRes.data);

            } catch {
                toast.error("Failed to load pet health and nutrition data");
            }
        };

        fetchData();
    }, [selectedPet]);

    // Add health log
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
        } catch (error) {
            console.log(error);
            toast.error("Failed to add health log");
        } finally {
            setSaving(false);
        }
    };

    // Delete health log
    const handleDelete = async (id) => {
        try {
            const deletedLog = logs.find((l) => l.id === id);
            await api.delete(`/health/${id}`);

            setLogs((prev) => prev.filter((l) => l.id !== id));

            if (deletedLog?.weight) {
                setWeightTrend((prev) => prev.filter((p) => p.date !== deletedLog.date));
            }

            toast.success("Health log deleted");
        } catch {
            toast.error("Delete failed");
        }
    };

    // Edit health log
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

    if (loading) return <div>Loading pet data...</div>;

    const chartData = weightTrend.map((item) => ({
        date: item.date.slice(5),
        weight: item.weight,
    }));

    return (
        <div className="space-y-6">

            {/* Pet Tabs */}
            <div className="flex gap-3 flex-wrap">
                {pets.map((pet) => (
                    <Button
                        key={pet.id}
                        variant={selectedPet?.id === pet.id ? "default" : "outline"}
                        className="rounded-xl"
                        onClick={() => setSelectedPet(pet)}
                    >
                        {pet.name}
                    </Button>
                ))}
            </div>

            {/* Add Health Log Dialog */}
            {selectedPet && (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Health Log
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Health Log – {selectedPet.name}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input name="date" type="date" required />
                            <Input name="weight" type="number" step="0.1" placeholder="Weight" required />
                            <Input name="temperature" type="number" step="0.1" placeholder="Temperature" required />
                            <Textarea name="notes" placeholder="Notes" />
                            <Button type="submit" disabled={saving} className="w-full">
                                {saving ? "Saving..." : "Save Log"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Health Logs Table */}
            {selectedPet && (
                <Card>
                    <CardContent className="p-5">
                        <h2 className="text-lg font-bold mb-4">Health Records – {selectedPet.name}</h2>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Weight</TableHead>
                                    <TableHead>Temp</TableHead>
                                    <TableHead>Notes</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <div className="flex flex-col items-center py-10 text-muted-foreground">
                                                <p>No health logs found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{log.date}</TableCell>
                                            <TableCell>{log.weight}</TableCell>
                                            <TableCell>{log.temperature}</TableCell>
                                            <TableCell>{log.notes}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="icon" variant="outline" onClick={() => setEditingLog(log)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="destructive" onClick={() => handleDelete(log.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Weight Trend Chart */}
            {selectedPet && (
                <Card>
                    <CardHeader>
                        <CardTitle>Weight Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {weightTrend.length === 0 ? (
                            <div className="flex items-center justify-center h-64 text-muted-foreground">
                                No health records yet
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="weight" stroke="#16a34a" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Meal Plan */}
            {selectedPet && mealPlan && (
                <Card>
                    <CardHeader>
                        <CardTitle>Nutrition & Meal Plan – {selectedPet.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">
                            Daily Calories: <strong>{mealPlan.dailyCalories} kcal</strong>
                        </p>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Meal Time</TableHead>
                                    <TableHead>Food</TableHead>
                                    <TableHead>Portion (g)</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mealPlan.meals.map((meal, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{meal.meal_time}</TableCell>
                                        <TableCell>{meal.food}</TableCell>
                                        <TableCell>{meal.portion_g}</TableCell>
                                        <TableCell>{meal.notes}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Extra Nutrition Info */}
                        <div className="mt-4 space-y-1 text-sm">
                            <p><strong>Key Nutrients:</strong> {mealPlan.nutrients.join(", ")}</p>
                            <p><strong>Foods to Avoid:</strong> {mealPlan.avoidFoods.join(", ")}</p>
                            <p><strong>Hydration:</strong> {mealPlan.hydration}</p>
                            {mealPlan.breedNotes && <p><strong>Breed Notes:</strong> {mealPlan.breedNotes}</p>}
                        </div>
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