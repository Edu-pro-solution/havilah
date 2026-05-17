import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { SessionContext } from "@/contexts/SessionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParentMaterials() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { currentSession } = useContext(SessionContext);
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);

  useEffect(() => {
    const loadMaterials = async () => {
      if (!currentSession?._id) return;
      try {
        const response = await axios.get(`${apiUrl}/api/download/${currentSession._id}`);
        setMaterials(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("loadMaterials error:", error);
      }
    };

    loadMaterials();
  }, [apiUrl, currentSession?._id]);

  const linkedClasses = Array.isArray((user as any)?.linkedClassNames) ? (user as any).linkedClassNames : [];
  const filtered = useMemo(() => {
    if (linkedClasses.length === 0) return materials;
    return materials.filter((item) => linkedClasses.includes(item.className));
  }, [linkedClasses, materials]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary">Ward Materials</h2>
        <p className="text-sm text-muted-foreground">Materials shared for your wards or their classes.</p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle className="text-base text-primary">Study Materials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No materials found for linked wards yet.</p>
          ) : (
            filtered.map((item) => (
              <div key={item._id} className="rounded-md border border-black bg-white p-4">
                <h3 className="font-bold text-black">{item.title || item.name || "Study Material"}</h3>
                <p className="text-sm text-black">{item.className || "All Classes"}</p>
                {item.Downloads && (
                  <a href={item.Downloads} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-primary underline">
                    Open Material
                  </a>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
