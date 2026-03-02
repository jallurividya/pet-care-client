import { useEffect, useState } from "react";
import api from "../services/api";
import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-toastify";
export default function InsurancePage() {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [myInsurance, setMyInsurance] = useState([]);
  const [autoPolicyNumber, setAutoPolicyNumber] = useState("");
  const [openSubscribe, setOpenSubscribe] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const generatePolicyNumber = () => {
    return `POL-${Date.now()}`;
  };

  // ---------------- FETCH PETS ----------------
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const res = await api.get("/pets");
        const petsData = res.data || [];

        setPets(petsData);

        if (petsData.length > 0) {
          setSelectedPet(petsData[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  // ---------------- FETCH POLICIES ----------------
  useEffect(() => {
    const fetchPolicies = async () => {
      const res = await api.get("/insurance/policies");
      setPolicies(res.data || []);
    };
    fetchPolicies();
  }, []);

  // ---------------- FETCH PET INSURANCE ----------------
  useEffect(() => {
    if (!selectedPet) return;

    const fetchMyInsurance = async () => {
      const res = await api.get(`/insurance/pet/${selectedPet.id}`);
      setMyInsurance(res.data || []);
    };

    fetchMyInsurance();
  }, [selectedPet]);

  // ---------------- AUTO END DATE (1 YEAR) ----------------
  const handleStartDateChange = (value) => {
    setStartDate(value);

    if (value) {
      const date = new Date(value);
      date.setFullYear(date.getFullYear() + 1);
      const formatted = date.toISOString().split("T")[0];
      setEndDate(formatted);
    }
  };

  // ---------------- SUBSCRIBE ----------------
  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!selectedPet) {
      toast.warning("Please select a pet first",);
      return;
    }

    const alreadySubscribed = myInsurance.find(
      (ins) => ins.policy_id === selectedPolicy
    );

    if (alreadySubscribed) {
      toast.warning("This pet already has this policy",);
      return;
    }

    try {
      setSaving(true);

      await api.post("/insurance/subscribe", {
        pet_id: selectedPet.id,
        policy_id: selectedPolicy,
        policy_number: autoPolicyNumber,
        start_date: startDate,
        end_date: endDate,
        emergency_contact: e.target.emergency_contact.value,
      });

      toast.success("Subscribed successfully!");
      setOpenSubscribe(false);

      const updated = await api.get(
        `/insurance/pet/${selectedPet.id}`
      );
      setMyInsurance(updated.data);

      setStartDate("");
      setEndDate("");

    } catch {
      toast("Subscription failed");
    } finally {
      setSaving(false);
    }
  };

  const isSubscribed = (policyId) =>
    myInsurance?.some((ins) => ins.policy_id === policyId);

  const statusBadge = (status) => {
    const colors = {
      active: "bg-green-100 text-green-600",
      pending: "bg-yellow-100 text-yellow-600",
      claimed: "bg-blue-100 text-blue-600",
      expired: "bg-red-100 text-red-600",
    };
    return colors[status] || "bg-gray-100";
  };

  if (loading) {
    return <div className="p-6">Loading Policies...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Insurance</h1>
      {/* PET TABS */}
      {pets.length > 0 && (
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
      )}

      {/* AVAILABLE POLICIES */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Available Insurance Policies
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((policy) => (
            <Card key={policy.id} className="rounded-2xl">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">{policy.policy_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {policy.provider_name}
                    </p>
                  </div>
                </div>

                <p className="text-sm">
                  Premium: ₹{policy.premium_amount}
                </p>
                <p className="text-sm">
                  Coverage: ₹{policy.coverage_amount}
                </p>

                <Button
                  className="w-full rounded-xl"
                  disabled={isSubscribed(policy.id)}
                  onClick={() => {
                    if (!selectedPet) {
                      toast("Select pet first",);
                      return;
                    }

                    setSelectedPolicy(policy.id);
                    setAutoPolicyNumber(generatePolicyNumber());
                    setOpenSubscribe(true);
                  }}
                >
                  {isSubscribed(policy.id)
                    ? "Already Subscribed"
                    : "Subscribe"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* MY INSURANCE */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          My Insurance – {selectedPet?.name}
        </h2>

        {myInsurance.length === 0 && (
          <p className="text-muted-foreground">
            No active insurance for this pet.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myInsurance.map((ins) => (
            <Card key={ins.id} className="rounded-2xl">
              <CardContent className="p-4 space-y-2">
                <p className="font-semibold">
                  {ins.insurance_policies.policy_name}
                </p>

                <div
                  className={`px-3 py-1 text-xs rounded-full inline-block ${statusBadge(
                    ins.claim_status
                  )}`}
                >
                  {ins.claim_status}
                </div>

                <p className="text-xs">
                  {ins.start_date} → {ins.end_date}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* SUBSCRIBE MODAL */}
      <Dialog open={openSubscribe} onOpenChange={setOpenSubscribe}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              Subscribe for {selectedPet?.name}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubscribe} className="space-y-4">

            <div>
              <Label>Policy Number</Label>
              <Input
                value={autoPolicyNumber}
                readOnly
                className="bg-muted"
              />
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                min={today}
                value={startDate}
                onChange={(e) =>
                  handleStartDateChange(e.target.value)
                }
                required
              />
            </div>

            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                readOnly
                className="bg-muted"
              />
            </div>

            <div>
              <Label>Emergency Contact</Label>
              <Input name="emergency_contact" required />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full"
            >
              {saving ? "Subscribing..." : "Confirm Subscription"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}