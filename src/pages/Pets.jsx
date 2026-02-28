import { useState, useEffect } from "react";
import {
    Save,
    Loader2,
    Trash2,
    Pencil
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "react-toastify";
import api from "@/api/api";

export default function PetsPage() {
    const [pets, setPets] = useState([]);
    const [selectedPetId, setSelectedPetId] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

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
        if (!window.confirm("Are you sure you want to delete this pet?"))
            return;

        try {
            await api.delete(`/pets/${selectedPetId}`);
            toast.success("Pet deleted");
            fetchPets();
            setSelectedPetId(null);
        } catch (error) {
            toast.error("Delete failed");
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

                <h1 className="text-2xl font-bold">My Pets</h1>

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
                    <Card className="rounded-2xl border-border/50">
                        <CardContent className="p-6">
                            <div className="grid gap-4 sm:grid-cols-2">

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

                                {/* ✅ DOB Field */}
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

                                {/* Buttons */}
                                <div className="sm:col-span-2 flex gap-3 flex-wrap">

                                    {/* <Button
                    onClick={() =>
                      isEditing ? handleSave() : setIsEditing(true)
                    }
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isEditing ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    ) : (
                      "Edit"
                    )}
                  </Button> */}

                                    <Button
                                        onClick={() =>
                                            isEditing ? handleSave() : setIsEditing(true)
                                        }
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : isEditing ? (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save
                                            </>
                                        ) : (
                                            <>
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Edit
                                            </>
                                        )}
                                    </Button>

                                    {isEditing && (
                                        <Button
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </Button>
                                    )}

                                    <Button
                                        variant="destructive"
                                        onClick={handleDeletePet}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>

                                </div>

                            </div>
                        </CardContent>
                    </Card>
                )}

            </div>
        </PageTransition>
    );
}