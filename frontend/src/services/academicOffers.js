import { api } from "./api";
const base="/api/academic-offers/";
export const listAcademicOffers=id=>api(base+"list.php?university_id="+encodeURIComponent(id));
export const listAdminAcademicOffers=id=>api(base+"admin.php?university_id="+encodeURIComponent(id));
function notify(){
 window.dispatchEvent(new Event("academic-offers-updated"));
 if("BroadcastChannel" in window){const c=new BroadcastChannel("academic-offers");c.postMessage("updated");c.close();}
}
export async function saveAcademicOffer(values){const row=await api(base+(values.id?"update.php":"create.php"),{method:values.id?"PUT":"POST",body:values});notify();return row;}
export async function deleteAcademicOffer(id,university_id){await api(base+"delete.php",{method:"DELETE",body:{id,university_id}});notify();}
export function uploadOfferImage(file){const body=new FormData();body.append("imagen",file);return api(base+"upload_image.php",{method:"POST",body});}
export function uploadOfferDocument(file){const body=new FormData();body.append("documento",file);return api(base+"upload_document.php",{method:"POST",body});}
