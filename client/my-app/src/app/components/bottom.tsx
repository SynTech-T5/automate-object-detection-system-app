"use client";
import { AlignStartVertical ,RefreshCw} from "lucide-react"; 
type Props = {
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  className?: string;
};

export default function Buttonname({ onSave, onCancel, onDelete, className = "" }: Props) {
const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm ";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        className={`${base} text-white bg-blue-600 hover:bg-blue-700 `}
      >
        
        Save Changes
      </button>

      <button
        type="button"
        className={`${base} text-gray-800 bg-white border border-gray-300 hover:bg-gray-100 `}
      >
        Cancel
      </button>

      <button
        type="button"
        className={`${base} text-white bg-red-600 hover:bg-red-700 `}
      >
        Delete
      </button>
    </div>
  );
}



type Props2 = {
  className?: string;
};
export  function Buttonname2({className = ""}:Props2 ){
    const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow-sm " ;
    
    return (
         <div className={`flex items-center gap-3 ${className}`}>
            <button   
            type="button"
            className={`${base} text-white bg-blue-600 hover:bg-blue-700 `}  
             >
            < AlignStartVertical size={15} className="mr-2"/>
             List View
            </button>

            <button   
            type="button"
            className={`${base} text-white bg-blue-600 hover:bg-blue-700 `}  
             >
            < RefreshCw size={15} className="mr-2"/>
             Refresh
            </button>
         </div>
    );
}