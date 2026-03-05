import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import api from "@/services/api";
import { Edit2, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function AdminInsurance() {
  const [policies, setPolicies] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [policyForm, setPolicyForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [openAddPolicy, setOpenAddPolicy] = useState(false);

  const [newPolicyForm, setNewPolicyForm] = useState({
    provider_name: "",
    policy_name: "",
    premium_amount: "",
    coverage_amount: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const policiesRes = await api.get("/insurance/policies");
      setPolicies(policiesRes.data);

      const subsRes = await api.get("/insurance/subscriptions");
      setSubscriptions(subsRes.data);
    } catch (error) {
      toast.error("Failed to load insurance data");
    } finally {
      setLoading(false);
    }
  };

  const handlePolicyChange = (e, isNew = false) => {
    const { name, value } = e.target;

    if (isNew) {
      setNewPolicyForm({ ...newPolicyForm, [name]: value });
    } else {
      setPolicyForm({ ...policyForm, [name]: value });
    }
  };

  const handleEditPolicy = (policy) => {
    setEditingPolicyId(policy.id);
    setPolicyForm(policy);
  };

  const handleSavePolicy = async () => {
    try {
      setSaving(true);

      await api.put(`/insurance/policies/${editingPolicyId}`, policyForm);

      toast.success("Policy updated successfully");

      setEditingPolicyId(null);
      fetchData();
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePolicy = async (id) => {
    if (!window.confirm("Are you sure you want to delete this policy?"))
      return;

    try {
      await api.delete(`/insurance/policies/${id}`);

      toast.success("Policy deleted successfully");

      fetchData();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const handleClaimUpdate = async (subscriptionId, newStatus) => {
    try {
      await api.put(`/insurance/claim/${subscriptionId}`, {
        claim_status: newStatus,
      });

      toast.success("Claim status updated");

      fetchData();
    } catch (error) {
      toast.error("Failed to update claim status");
    }
  };

  const handleAddPolicy = async () => {
    try {
      await api.post("/insurance/policies", newPolicyForm);

      toast.success("New policy added successfully");

      setNewPolicyForm({
        provider_name: "",
        policy_name: "",
        premium_amount: "",
        coverage_amount: "",
        description: "",
      });

      fetchData();

      setOpenAddPolicy(false);
    } catch (error) {
      toast.error("Failed to add policy");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Insurance Management</h1>

        {/* Add Policy Dialog */}
        <Dialog open={openAddPolicy} onOpenChange={setOpenAddPolicy}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-1" /> Add New Policy
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Policy</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <Input
                placeholder="Provider Name"
                name="provider_name"
                value={newPolicyForm.provider_name}
                onChange={(e) => handlePolicyChange(e, true)}
              />

              <Input
                placeholder="Policy Name"
                name="policy_name"
                value={newPolicyForm.policy_name}
                onChange={(e) => handlePolicyChange(e, true)}
              />

              <Input
                placeholder="Premium Amount"
                type="number"
                name="premium_amount"
                value={newPolicyForm.premium_amount}
                onChange={(e) => handlePolicyChange(e, true)}
              />

              <Input
                placeholder="Coverage Amount"
                type="number"
                name="coverage_amount"
                value={newPolicyForm.coverage_amount}
                onChange={(e) => handlePolicyChange(e, true)}
              />

              <Textarea
                placeholder="Description"
                name="description"
                value={newPolicyForm.description}
                onChange={(e) => handlePolicyChange(e, true)}
              />
            </div>

            <DialogFooter>
              <Button onClick={handleAddPolicy}>Add Policy</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Policies */}
      <h2 className="text-xl font-semibold">Policies</h2>

      <div className="space-y-4">
        {policies.map((policy) => (
          <Card key={policy.id} className="rounded-2xl border-border/50">
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {editingPolicyId === policy.id ? (
                <>
                  <Input
                    name="provider_name"
                    value={policyForm.provider_name || ""}
                    onChange={handlePolicyChange}
                  />

                  <Input
                    name="policy_name"
                    value={policyForm.policy_name || ""}
                    onChange={handlePolicyChange}
                  />

                  <Input
                    type="number"
                    name="premium_amount"
                    value={policyForm.premium_amount || ""}
                    onChange={handlePolicyChange}
                  />

                  <Input
                    type="number"
                    name="coverage_amount"
                    value={policyForm.coverage_amount || ""}
                    onChange={handlePolicyChange}
                  />

                  <Textarea
                    name="description"
                    value={policyForm.description || ""}
                    onChange={handlePolicyChange}
                  />

                  <div className="flex gap-2 col-span-full">
                    <Button onClick={handleSavePolicy} disabled={saving}>
                      Save
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setEditingPolicyId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <strong>Provider:</strong> {policy.provider_name}
                  </p>

                  <p>
                    <strong>Name:</strong> {policy.policy_name}
                  </p>

                  <p>
                    <strong>Premium:</strong> ₹{policy.premium_amount}
                  </p>

                  <p>
                    <strong>Coverage:</strong> ₹{policy.coverage_amount}
                  </p>

                  <p>
                    <strong>Description:</strong> {policy.description}
                  </p>

                  <div className="flex gap-2 col-span-full">
                    <Button
                      size="sm"
                      onClick={() => handleEditPolicy(policy)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" /> Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeletePolicy(policy.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscriptions */}
      <h2 className="text-xl font-semibold mt-8">User Subscriptions</h2>

      <div className="space-y-4">
        {subscriptions.map((sub) => (
          <Card key={sub.id} className="rounded-2xl border-border/50">
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p>
                <strong>User:</strong> {sub.pets?.app_users?.email}
              </p>

              <p>
                <strong>Pet:</strong> {sub.pets?.name}
              </p>

              <p>
                <strong>Policy:</strong>{" "}
                {sub.insurance_policies?.policy_name}
              </p>

              <p>
                <strong>Status:</strong> {sub.claim_status}
              </p>

              <div className="flex gap-2 col-span-full">
                <Button
                  size="sm"
                  onClick={() => handleClaimUpdate(sub.id, "active")}
                >
                  Set Active
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleClaimUpdate(sub.id, "claimed")}
                >
                  Claimed
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleClaimUpdate(sub.id, "expired")}
                >
                  Expired
                </Button>

                <Button
                  size="sm"
                  onClick={() => handleClaimUpdate(sub.id, "pending")}
                >
                  Pending
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}