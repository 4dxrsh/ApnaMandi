import { Button } from "@/components/ui/button";

interface RoleSelectionProps {
  onRoleSelect: (role: 'VENDOR' | 'PARTNER') => void;
}

export default function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Choose Your Role</h2>
      
      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full p-4 h-auto text-left border-2 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
          onClick={() => onRoleSelect('VENDOR')}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-orange-200 transition-colors">
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">I am a Food Vendor</h3>
              <p className="text-sm text-gray-600">Place orders for fresh ingredients</p>
            </div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          className="w-full p-4 h-auto text-left border-2 hover:border-green-500 hover:bg-green-50 transition-all duration-200"
          onClick={() => onRoleSelect('PARTNER')}
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">I want to be a Partner</h3>
              <p className="text-sm text-gray-600">Procure and deliver ingredients</p>
            </div>
          </div>
        </Button>
      </div>
    </div>
  );
}
