import { api } from "./api";
const base="/api/university-gallery/";
export const listUniversityGallery=id=>api(base+"list.php?university_id="+encodeURIComponent(id));
export const listAdminUniversityGallery=id=>api(base+"admin.php?university_id="+encodeURIComponent(id));
function notify(){
 window.dispatchEvent(new Event("university-gallery-updated"));
 if("BroadcastChannel" in window){const c=new BroadcastChannel("university-gallery");c.postMessage("updated");c.close();}
}
export async function saveUniversityGalleryImage(values){const row=await api(base+(values.id?"update.php":"create.php"),{method:values.id?"PUT":"POST",body:values});notify();return row;}
export async function deleteUniversityGalleryImage(id,university_id){await api(base+"delete.php",{method:"DELETE",body:{id,university_id}});notify();}
export async function uploadUniversityGalleryImage(file){
 const body=new FormData();body.append("imagen",file);
 const result=await api(base+"upload.php",{method:"POST",body});
 return {imagen:result.imagen};
}
