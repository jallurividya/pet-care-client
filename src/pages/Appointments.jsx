import { useState, useEffect } from "react";
import { Plus, CalendarDays, Loader2, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "react-toastify";
import api from "@/api/api";

const statusColors = {
  upcoming: "bg-blue-500/15 text-blue-600 border border-blue-500/30",
  completed: "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30",
  cancelled: "bg-gray-500/15 text-gray-600 border border-gray-500/30",
};

export default function AppointmentsPage() {
  const [appts, setAppts] = useState([]);
  const [pets, setPets] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  // Emergency vets
  const [emergencyVets, setEmergencyVets] = useState([]);
  const [loadingVets, setLoadingVets] = useState(false);
  const [openVetModal, setOpenVetModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptRes, petRes] = await Promise.all([
        api.get("/vet-appointments"),
        api.get("/pets"),
      ]);

      setAppts(apptRes.data || []);
      setPets(petRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load appointments or pets");
    } finally {
      setLoading(false);
    }
  };

  const getComputedStatus = (appointment) => {
    if (appointment.status === "cancelled") return "cancelled";

    const now = new Date();
    const apptDate = new Date(appointment.appointment_date);

    if (apptDate < now && appointment.status === "Scheduled") {
      return "completed";
    }

    return appointment.status?.toLowerCase() || "upcoming";
  };

  const filteredAppts = appts.filter((a) => {
    const status = getComputedStatus(a);
    if (filter === "all") return true;
    return status === filter;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const payload = {
      pet_id: fd.get("pet_id"),
      vet_name: fd.get("vet_name"),
      clinic_name: fd.get("clinic_name"),
      appointment_date: fd.get("appointment_date"),
      purpose: fd.get("purpose"),
      reminder_date: fd.get("reminder_date"),
      notes: fd.get("notes"),
    };

    try {
      setSaving(true);

      if (editing) {
        const res = await api.put(`/vet-appointments/${editing.id}`, payload);

        setAppts((prev) =>
          prev.map((a) => (a.id === editing.id ? res.data.appointment : a))
        );

        toast.success("Appointment updated");
      } else {
        const res = await api.post("/vet-appointments", payload);

        setAppts((prev) =>
          [res.data.appointment, ...prev].sort(
            (a, b) =>
              new Date(a.appointment_date) - new Date(b.appointment_date)
          )
        );

        toast.success("Appointment created");
      }

      setOpen(false);
      setEditing(null);
      e.currentTarget.reset();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Cancel this appointment?")) return;

    try {
      await api.put(`/vet-appointments/${id}`, {
        status: "cancelled",
      });

      setAppts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "cancelled" } : a))
      );

      toast.success("Appointment cancelled");
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch nearby emergency vets using geolocation
  const fetchEmergencyVets = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }

    setLoadingVets(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await api.get(
            `/emergency-vets?lat=${latitude}&lng=${longitude}`
          );
          setEmergencyVets(res.data.vets || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingVets(false);
        }
      },
      (err) => {
        console.error(err);
        toast.error("Location permission denied");
        setLoadingVets(false);
      }
    );
  };

  if (loading) return <div>Loading appointments...</div>;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold">Vet Appointments</h1>

          {/* Add Appointment */}
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) setEditing(null);
            }}
          >
            <DialogTrigger asChild>
              <Button className="rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Add Appointment
              </Button>
            </DialogTrigger>

            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit Appointment" : "Schedule Appointment"}
                </DialogTitle>
                <DialogDescription>Fill the details below.</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Pet */}
                <div className="space-y-2">
                  <Label>Pet</Label>
                  <Select name="pet_id" defaultValue={editing?.pet_id} required>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select pet" />
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

                {/* Vet Name */}
                <div className="space-y-2">
                  <Label htmlFor="vet_name">Vet Name</Label>
                  <Input
                    id="vet_name"
                    name="vet_name"
                    defaultValue={editing?.vet_name}
                    placeholder="Enter vet name"
                    required
                  />
                </div>

                {/* Clinic Name */}
                <div className="space-y-2">
                  <Label htmlFor="clinic_name">Clinic Name</Label>
                  <Input
                    id="clinic_name"
                    name="clinic_name"
                    defaultValue={editing?.clinic_name}
                    placeholder="Enter clinic name"
                  />
                </div>

                {/* Appointment Date */}
                <div className="space-y-2">
                  <Label htmlFor="appointment_date">Appointment Date & Time</Label>
                  <Input
                    id="appointment_date"
                    name="appointment_date"
                    type="datetime-local"
                    defaultValue={editing?.appointment_date?.slice(0, 16)}
                    required
                  />
                </div>

                {/* Purpose */}
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    name="purpose"
                    defaultValue={editing?.purpose}
                    placeholder="Reason for visit"
                  />
                </div>

                {/* Reminder Date */}
                <div className="space-y-2">
                  <Label htmlFor="reminder_date">Reminder Date</Label>
                  <Input
                    id="reminder_date"
                    name="reminder_date"
                    type="date"
                    defaultValue={editing?.reminder_date}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    defaultValue={editing?.notes}
                    placeholder="Additional notes..."
                  />
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Save"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Emergency Vet Locator */}
          <Dialog open={openVetModal} onOpenChange={setOpenVetModal}>
            <DialogTrigger asChild>
              <Button
                className="bg-red-600 text-white rounded-xl"
                onClick={fetchEmergencyVets}
              >
                Emergency Vet Locator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Emergency Vets Nearby</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-80 overflow-y-auto mt-2">
                {loadingVets && <p>Loading nearby vets...</p>}
                {!loadingVets && emergencyVets.length === 0 && (
                  <p>No emergency vets found nearby.</p>
                )}
                {!loadingVets &&
                  emergencyVets.map((vet) => (
                    <div
                      key={vet.place_id}
                      className="border p-2 rounded-md space-y-1"
                    >
                      <h4 className="font-bold">{vet.name}</h4>
                      <p>{vet.address}</p>
                      {vet.rating && (
                        <p>
                          Rating: {vet.rating} ({vet.user_ratings_total})
                        </p>
                      )}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${vet.location.lat},${vet.location.lng}`}
                        target="_blank"
                        className="text-blue-600 underline"
                      >
                        Get Directions
                      </a>
                    </div>
                  ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {["all", "upcoming", "completed", "cancelled"].map((tab) => (
            <Button
              key={tab}
              variant={filter === tab ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(tab)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Appointment List */}
        <div className="space-y-3">
          {filteredAppts.map((a) => {
            const status = getComputedStatus(a);

            return (
              <Card
                key={a.id}
                className={`rounded-2xl border-border/50 ${
                  status === "cancelled" ? "opacity-60" : ""
                }`}
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{a.vet_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Pet: {a.pets?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(a.appointment_date).toLocaleString()}
                    </p>
                    <p className="text-xs mt-1">{a.purpose}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge className={statusColors[status]}>{status}</Badge>

                    {status !== "cancelled" && (
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setEditing(a);
                            setOpen(true);
                          }}
                        >
                          <Pencil size={10} />
                        </Button>

                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleCancel(a.id)}
                        >
                          <Trash2 size={10} />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}