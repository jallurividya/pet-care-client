import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  Trash2,
  Pencil,
  Plus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "react-toastify";
import api from "@/services/api";

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newPet, setNewPet] = useState({
    name: "",
    species: "",
    breed: "",
    gender: "",
    dob: "",
    weight: "",
    medical_history: "",
    photo_url:
      "https://img.freepik.com/premium-photo/adorable-pet-profile-picture-perfect-social-media-pet-lovers_719166-970.jpg",
  });
  const [savingPet, setSavingPet] = useState(false);

  // ===== Diet Suggestion State =====
  const [dietSuggestion, setDietSuggestion] = useState(null);
  const [loadingDiet, setLoadingDiet] = useState(false);
  const [showDietModal, setShowDietModal] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const res = await api.get("/pets");
      setPets(res.data);
      if (res.data.length > 0) {
        setSelectedPetId(res.data[0].id);
        setFormData(res.data[0]);
      }
    } catch (error) {
      toast.error("Failed to load pets");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeNewPet = (e) => {
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
        photo_url:
          "https://img.freepik.com/premium-photo/adorable-pet-profile-picture-perfect-social-media-pet-lovers_719166-970.jpg",
      });
      fetchPets();
    } catch (error) {
      toast.error("Failed to add pet");
    } finally {
      setSavingPet(false);
    }
  };

  useEffect(() => {
    if (!selectedPetId) return;
    const selected = pets.find((p) => p.id === selectedPetId);
    if (selected) setFormData(selected);
  }, [selectedPetId, pets]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put(`/pets/${selectedPetId}`, formData);
      toast.success("Updated successfully");
      setIsEditing(false);
      fetchPets();
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePet = async () => {
    if (!window.confirm("Are you sure you want to delete this pet?")) return;
    try {
      await api.delete(`/pets/${selectedPetId}`);
      toast.success("Pet deleted");
      fetchPets();
      setSelectedPetId(null);
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // ===== Fetch Diet Plan for Selected Pet =====
 const fetchDietPlan = async (pet) => {
  if (!pet.species || !pet.breed || !pet.weight || !pet.dob) {
    toast.error("Pet must have species, breed, weight, and date of birth");
    return;
  }
  try {
    setLoadingDiet(true);
    const res = await api.post("/ai/diet", {
      species: pet.species,
      breed: pet.breed,
      weight: pet.weight,
      dob: pet.dob,
    });

    // Strip markdown formatting
    let suggestion = res.data.suggestion;
    if (typeof suggestion === "string") {
      suggestion = suggestion.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*/g, "");
    }

    setDietSuggestion(suggestion);
    setShowDietModal(true);
  } catch (error) {
    toast.error("Failed to fetch diet suggestion");
    console.error(error);
  } finally {
    setLoadingDiet(false);
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold">My Pets</h1>

          <div className="flex gap-2 flex-wrap">
            {/* Get Diet Plan Button */}
            <Button
              onClick={() => fetchDietPlan(formData)}
              disabled={loadingDiet || !selectedPetId}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 whitespace-nowrap"
            >
              {loadingDiet ? "Fetching Diet Plan..." : "Get Diet Plan"}
            </Button>

            {/* Add Pet Button */}
            <Button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 whitespace-nowrap"
            >
              <Plus size={18} /> Add Pet
            </Button>
          </div>
        </div>

        {/* Pet Selector */}
        <div className="flex gap-2 flex-wrap">
          {pets.map((p) => (
            <Button
              key={p.id}
              variant={p.id === selectedPetId ? "default" : "outline"}
              onClick={() => !isEditing && setSelectedPetId(p.id)}
            >
              {p.name}
            </Button>
          ))}
        </div>

        {!selectedPetId && (
          <p className="text-muted-foreground">No pets found.</p>
        )}

        {selectedPetId && (
          <Card className="rounded-2xl border border-gray-200 max-w-lg mx-auto">
            <CardContent className="p-6 flex flex-col items-center">
              {/* Circular Image */}
              <img
                src={formData.photo_url}
                alt={formData.name}
                className="h-26 w-26 rounded-full object-cover border-4 border-gray-300 mb-6"
              />

              {/* Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div>
                  <Label>Name</Label>
                  <Input
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                  />
                </div>
                <div>
                  <Label>Species</Label>
                  <Input
                    name="species"
                    value={formData.species || ""}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                  />
                </div>
                <div>
                  <Label>Breed</Label>
                  <Input
                    name="breed"
                    value={formData.breed || ""}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                  />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    name="weight"
                    value={formData.weight || ""}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                  />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    name="dob"
                    value={formData.dob ? formData.dob.split("T")[0] : ""}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Medical History</Label>
                  <Textarea
                    name="medical_history"
                    value={formData.medical_history || ""}
                    onChange={handleChange}
                    disabled={!isEditing || saving}
                    rows={3}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 flex-wrap justify-center">
                <Button
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" /> Save
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </>
                  )}
                </Button>

                {isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}

                <Button variant="destructive" onClick={handleDeletePet}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== Diet Plan Modal ===== */}
        {showDietModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl rounded-2xl bg-background p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Diet Plan for {formData.name}</h2>

              {loadingDiet ? (
                <p>Fetching diet plan...</p>
              ) : (
                <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-lg max-h-[60vh] overflow-y-auto text-sm">
                  {dietSuggestion}
                </pre>
              )}

              <div className="flex justify-end mt-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDietModal(false);
                    setDietSuggestion(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ===== Add Pet Modal ===== */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Add New Pet</h2>
              <div className="space-y-3">
                <div>
                  <Label>Name</Label>
                  <Input name="name" value={newPet.name} onChange={handleChangeNewPet} />
                </div>
                <div>
                  <Label>Species</Label>
                  <Input name="species" value={newPet.species} onChange={handleChangeNewPet} />
                </div>
                <div>
                  <Label>Breed</Label>
                  <Input name="breed" value={newPet.breed} onChange={handleChangeNewPet} />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Input name="gender" value={newPet.gender} onChange={handleChangeNewPet} />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" name="dob" value={newPet.dob} onChange={handleChangeNewPet} />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    name="weight"
                    value={newPet.weight}
                    onChange={handleChangeNewPet}
                  />
                </div>
                <div>
                  <Label>Medical History</Label>
                  <Textarea
                    name="medical_history"
                    value={newPet.medical_history}
                    onChange={handleChangeNewPet}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
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