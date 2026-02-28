import { useState, useEffect } from "react";
import { Plus, Syringe, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "react-toastify";
import api from "@/api/api";

const statusLabels = {
    "up-to-date": "Up To Date",
    "coming-soon": "Coming Soon",
    overdue: "Overdue",
    "due-today": "Due Today",
    info: "No Due Date",
};

const statusColors = {
    "up-to-date": "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
    "coming-soon": "bg-amber-500/15 text-amber-600 border border-amber-500/30",
    overdue: "bg-red-500/15 text-red-600 border border-red-500/30",
    "due-today": "bg-blue-500/15 text-blue-600 border border-blue-500/30",
    info: "bg-gray-500/15 text-gray-600 border border-gray-500/30",
};
export default function VaccinationsPage() {
    const [vaccinations, setVaccinations] = useState([]);
    const [pets, setPets] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

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
            toast({ title: "Failed to load data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const getStatus = (dueDate) => {
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
            });
            setVaccinations(prev => [
                res.data.vaccination,
                ...prev
            ]);
            toast.success("Added successfully");
            setOpen(false);
            e.currentTarget.reset();
        } catch (error) {
            console.log(error);
            
        } finally {
            setCreating(false);
        }
    };
    if (loading) return <div>Loading vaccinations...</div>;
    return (
        <PageTransition>
            <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <h1 className="text-2xl font-heading font-bold">
                        Vaccinations
                    </h1>

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
                                {/* Pet Select */}
                                <div className="space-y-2">
                                    <Label>Select Pet</Label>
                                    <Select name="pet_id" required>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue placeholder="Choose pet" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pets.map((pet) => (
                                                <SelectItem
                                                    key={pet.id}
                                                    value={pet.id}
                                                >
                                                    {pet.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Vaccine Name</Label>
                                    <Input
                                        name="vaccine_name"
                                        className="rounded-xl"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label>Date Given</Label>
                                        <Input
                                            name="given_date"
                                            type="date"
                                            className="rounded-xl"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Next Due</Label>
                                        <Input
                                            name="next_due_date"
                                            type="date"
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full rounded-xl"
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

                <div className="space-y-3">
                    {vaccinations.map((v) => {
                        const status = getStatus(v.next_due_date);

                        return (
                            <Card
                                key={v.id}
                                className="rounded-2xl border-border/50"
                            >
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <Syringe className="h-5 w-5 text-primary" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold">
                                            {v.vaccine_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Pet: {v.pets?.name} · Given: {v.given_date} · Due: {v.next_due_date}
                                        </p>
                                    </div>
                                    <Badge className={`rounded-lg text-xs ${statusColors[status]}`}>
                                        {statusLabels[status]}
                                    </Badge>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </PageTransition>
    );
}