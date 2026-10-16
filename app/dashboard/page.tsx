import Sidebar from "../../components/dashboard/Sidebar";
import Header from "../../components/dashboard/Header";
import DashboardContent from "../../components/dashboard/DashboardContent";

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <div className="lg:pl-64">
                <Header />

                <main className="p-6 lg:p-8">
                    <DashboardContent />
                </main>
            </div>
        </div>
    );
}