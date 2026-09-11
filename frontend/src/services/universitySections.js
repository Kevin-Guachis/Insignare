import { api } from "./api";
const base="/api/university-sections/";
export const listUniversitySections=id=>api(base+"list.php?university_id="+encodeURIComponent(id));
export const listAdminUniversitySections=id=>api(base+"admin.php?university_id="+encodeURIComponent(id));
function notify() {
 window.dispatchEvent(new Event("university-sections-updated"));
 if("BroadcastChannel" in window){const channel=new BroadcastChannel("university-sections");channel.postMessage("updated");channel.close();}
}
export async function saveUniversitySection(values) {
 const row=await api(base+(values.id?"update.php":"create.php"),{method:values.id?"PUT":"POST",body:values});notify();return row;
}
export async function deleteUniversitySection(id,universityId) {
 await api(base+"delete.php",{method:"DELETE",body:{id,university_id:universityId}});notify();
}
