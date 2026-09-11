import { api } from "./api";
const base="/api/universities/";
export const listUniversities=()=>api(base+"list.php");
export const listAdminUniversities=()=>api(base+"admin.php");
function notify() {
 window.dispatchEvent(new Event("universities-updated"));
 if("BroadcastChannel" in window){const c=new BroadcastChannel("universities");c.postMessage("updated");c.close();}
}
export async function saveUniversity(values) {
 const row=await api(base+(values.id?"update.php":"create.php"),{method:values.id?"PUT":"POST",body:values});
 notify();return row;
}
export async function deleteUniversity(id) {
 await api(base+"delete.php",{method:"DELETE",body:{id}});notify();
}
export function uploadUniversityImage(file) {
 const body=new FormData();body.append("imagen",file);
 return api(base+"upload.php",{method:"POST",body});
}
