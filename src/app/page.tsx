import { MailDisplay } from "@/components/mail/mail-display";
import { MailSidebar } from "@/components/mail/mail-sidebar";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { mails } from "@/lib/data";

export default function Home() {
  return (
    <SidebarProvider defaultOpen>
        <Sidebar>
          <MailSidebar />
        </Sidebar>
        <SidebarInset>
          <MailDisplay mails={mails} />
        </SidebarInset>
    </SidebarProvider>
  );
}
