import { useEffect, useState } from "react";
import { CalendarDays, Activity, Scale, Syringe, PawPrint, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import api from "@/api/api";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPet, setNewPet] = useState({
    name: "",
    species: "",
    breed: "",
    gender: "",
    dob: "",
    weight: "",
    medical_history: "",
    photo_url: "https://img.freepik.com/premium-photo/adorable-pet-profile-picture-perfect-social-media-pet-lovers_719166-970.jpg"
  });
  const [savingPet, setSavingPet] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard");
      setDashboard(res.data);
    } catch (error) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setNewPet({ ...newPet, [e.target.name]: e.target.value });
  };

  const handleSavePet = async () => {
    try {
      setSavingPet(true);
      await api.post("/pets", newPet);
      toast.success("Pet added successfully!");
      setShowModal(false);
      setNewPet({
        name: "",
        species: "",
        breed: "",
        gender: "",
        dob: "",
        weight: "",
        medical_history: "",
        photo_url: "https://img.freepik.com/premium-photo/adorable-pet-profile-picture-perfect-social-media-pet-lovers_719166-970.jpg"
      });
      fetchDashboard();
    } catch (error) {
      toast.error("Failed to add pet");
    } finally {
      setSavingPet(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  const { totalPets, upcomingVaccinations, upcomingAppointments, totalExpenses } = dashboard;

  const summaryCards = [
    {
      title: "Upcoming Appointment",
      value:
        upcomingAppointments?.length > 0
          ? `${upcomingAppointments[0].reason || "Vet Visit"} — ${upcomingAppointments[0].appointment_date}`
          : "None scheduled",
      icon: CalendarDays,
      color: "text-primary bg-primary/10",
      link: "/appointments",
    },
    {
      title: "Total Pets",
      value: `${totalPets} registered`,
      icon: PawPrint,
      color: "text-success bg-success/10",
      link: "/pets",
    },
    {
      title: "Total Expenses",
      value: `₹ ${totalExpenses}`,
      icon: Scale,
      color: "text-accent bg-accent/10",
      link: "/expenses",
    },
    {
      title: "Vaccinations (Next 7 Days)",
      value: `${upcomingVaccinations?.length || 0} due`,
      icon: Syringe,
      color: "text-destructive bg-destructive/10",
      link: "/vaccinations",
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">

        {/* Welcome + Add Pet Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <PawPrint className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">Welcome User 👋</h1>
              <p className="text-muted-foreground">
                You have {totalPets} pets in your care
              </p>
            </div>
          </div>

          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            <Plus size={18} /> Add Pet
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
          {summaryCards.map((card) => (
            <Link key={card.title} to={card.link}>
              <Card className="h-full rounded-2xl hover-scale cursor-pointer border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="flex h-full items-start gap-4 p-5">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                    <p className="mt-1 text-sm font-semibold line-clamp-2">{card.value}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Upcoming Appointments */}
        <Card className="rounded-2xl border-border/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-bold">Upcoming Appointments</h2>
              <Link to="/appointments" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>

            {upcomingAppointments?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming appointments</p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 4).map((appt) => (
                  <div key={appt.id} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{appt.reason || "Vet Visit"}</p>
                      <p className="text-xs text-muted-foreground truncate">{appt.appointment_date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Pet Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Add New Pet</h2>

              <div className="space-y-3">
                <div>
                  <Label>Name</Label>
                  <Input name="name" value={newPet.name} onChange={handleChange} />
                </div>
                <div>
                  <Label>Species</Label>
                  <Input name="species" value={newPet.species} onChange={handleChange} />
                </div>
                <div>
                  <Label>Breed</Label>
                  <Input name="breed" value={newPet.breed} onChange={handleChange} />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Input name="gender" value={newPet.gender} onChange={handleChange} />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" name="dob" value={newPet.dob} onChange={handleChange} />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input type="number" name="weight" value={newPet.weight} onChange={handleChange} />
                </div>
                <div>
                  <Label>Medical History</Label>
                  <Textarea name="medical_history" value={newPet.medical_history} onChange={handleChange} rows={3} />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button onClick={handleSavePet} disabled={savingPet}>
                    {savingPet ? "Saving..." : "Add Pet"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}