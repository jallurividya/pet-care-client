import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import {
  Plus,
  Footprints,
  UtensilsCrossed,
  Pill,
  Gamepad2,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";

const typeIcons = {
  walk: Footprints,
  feeding: UtensilsCrossed,
  medication: Pill,
  play: Gamepad2,
};

export default function ActivitiesPage() {
  const hasFetchedPets = useRef(false);

  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [activities, setActivities] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH PETS ----------------
  useEffect(() => {
    if (hasFetchedPets.current) return;
    hasFetchedPets.current = true;

    const fetchPets = async () => {
      try {
        const res = await api.get("/pets");
        const petsData = res.data || [];
        setPets(petsData);
        if (petsData.length > 0) setSelectedPet(petsData[0]);
      } catch (err) {
        if (err.response?.status !== 401) toast.error("Failed to load pets");
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  // ---------------- FETCH ACTIVITIES ----------------
  const fetchActivities = async (petId) => {
    try {
      const res = await api.get(`/activities/pet/${petId}`);
      setActivities(res.data || []);
    } catch (err) {
      if (err.response?.status !== 401) toast.error("Failed to load activities");
      setActivities([]);
    }
  };

  useEffect(() => {
    if (selectedPet?.id) fetchActivities(selectedPet.id);
  }, [selectedPet]);

  // ---------------- NOTIFICATIONS / REMINDERS ----------------
  useEffect(() => {
    if (!activities || activities.length === 0 || !selectedPet) return;

    const now = new Date();
    const next24h = new Date();
    next24h.setHours(now.getHours() + 24);

    const filtered = activities.filter(act => act.pet_id === selectedPet.id);

    filtered.forEach((act) => {
      const actDate = new Date(act.date);
      if (actDate >= now && actDate <= next24h) {
        toast.info(`Upcoming ${act.type} for ${selectedPet.name} on ${act.date}`);
      }
    });
  }, [activities, selectedPet]);

  // ---------------- ADD ACTIVITY ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPet?.id) {
      toast.error("Please select a pet first");
      return;
    }

    const fd = new FormData(e.currentTarget);
    const payload = {
      pet_id: selectedPet.id,
      type: fd.get("type"),
      duration: Number(fd.get("duration")),
      date: fd.get("date"),
      notes: fd.get("notes"),
    };

    setSaving(true);
    try {
      const res = await api.post("/activities", payload);
      if (res?.data) {
        setActivities((prev) => [res.data, ...prev]);
        toast.success("Activity added!");
        setOpen(false);
        e.currentTarget.reset();

        const actDate = new Date(res.data.date + "Z");
        const now = new Date();
        const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        if (actDate >= now && actDate <= next24h) {
          toast.info(
            `Reminder: Upcoming ${res.data.type} for ${selectedPet.name} on ${actDate.toLocaleDateString()}`
          );
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  // ---------------- DELETE ACTIVITY ----------------
  const handleDelete = async (id) => {
    try {
      await api.delete(`/activities/${id}`);
      setActivities((prev) => prev.filter((a) => a.id !== id));
      toast.success("Activity deleted");
    } catch (err) {
      if (err.response?.status !== 401) toast.error("Delete failed");
    }
  };

  if (loading) return <div className="p-6">Loading activities...</div>;

  return (
    <div className="space-y-6">
      {/* HEADING + ADD BUTTON */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Activities</h1>

        {selectedPet && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl flex items-center hover:bg-primary/35 transition-colors">
                <Plus className="mr-2 h-4 w-4" />
                Add Activity for {selectedPet.name}
              </Button>
            </DialogTrigger>

            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add Activity – {selectedPet.name}</DialogTitle>
                <DialogDescription>
                  Fill in activity details for your pet.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <select
                    name="type"
                    defaultValue="walk"
                    className="w-full rounded-xl border px-3 py-2"
                  >
                    <option value="walk">Walk</option>
                    <option value="feeding">Feeding</option>
                    <option value="play">Play</option>
                    <option value="medication">Medication</option>
                  </select>
                </div>

                <div>
                  <Label>Duration (minutes)</Label>
                  <Input name="duration" type="number" required className="rounded-xl" />
                </div>

                <div>
                  <Label>Date & Time</Label>
                  <Input
                    name="date"
                    type="datetime-local"
                    defaultValue={new Date().toISOString().slice(0, 16)}
                    required
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea name="notes" rows={2} className="rounded-xl" />
                </div>

                <Button type="submit" disabled={saving} className="w-full rounded-xl">
                  {saving ? "Saving..." : "Save Activity"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* PET TABS */}
      <div className="flex gap-3 flex-wrap">
        {pets.map((pet) => (
          <Button
            key={pet.id}
            variant={selectedPet?.id === pet.id ? "default" : "outline"}
            className="rounded-xl hover:bg-primary/10 transition-colors"
            onClick={() => setSelectedPet(pet)}
          >
            {pet.name}
          </Button>
        ))}
      </div>

      {/* ACTIVITIES GRID */}
      {selectedPet && activities.length > 0 ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {activities.map((act) => {
            const Icon = typeIcons[act.type];
            const localDate = new Date(act.date + "Z");
            return (
              <Card
                key={act.id}
                className="rounded-2xl hover:shadow-lg hover:scale-105 transition-transform duration-200"
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
                        {Icon && <Icon className="h-4 w-4 text-primary" />}
                      </div>
                      <div>
                        <p className="font-semibold capitalize">{act.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {localDate.toLocaleDateString()} • {act.duration} min
                        </p>
                      </div>
                    </div>
                    <Trash2
                      onClick={() => handleDelete(act.id)}
                      className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive hover:scale-110 transition-transform"
                    />
                  </div>

                  {act.notes && <p className="text-sm text-muted-foreground">{act.notes}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : selectedPet ? (
        <p className="text-muted-foreground">No activities yet for this pet.</p>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          No pets found. Add a pet first.
        </div>
      )}
    </div>
  );
}