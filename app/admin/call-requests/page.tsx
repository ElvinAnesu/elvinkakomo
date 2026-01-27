
import Card from "@/app/components/Card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase-server";
import Button from "@/app/components/Button";

export const dynamic = 'force-dynamic';

export default async function CallRequestsPage() {

    const { data: callRequests, error } = await supabaseServer
    .from("call_requests")
    .select("*");

    if (error) {
        console.error("Error fetching call requests:", error);
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-[#0F172A]">Call Requests</h1>
            </div>
            <Card className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone Number</TableHead>
                            <TableHead>Project Overview</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {callRequests && callRequests.length > 0 ? (
                            callRequests.map((callRequest) => (
                                <TableRow key={callRequest.id}>
                                    <TableCell>{callRequest.name}</TableCell>
                                    <TableCell>{callRequest.email}</TableCell>
                                    <TableCell>{callRequest.phonenumber}</TableCell>
                                    <TableCell>{callRequest.project_overview}</TableCell>
                                    <TableCell>
                                        <Button variant="primary" className="text-xs p-3">
                                            contact
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ):(
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-[#64748B]">
                                    No call requests found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
    
}