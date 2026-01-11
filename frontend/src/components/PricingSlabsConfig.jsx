import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Settings, Plus, Trash2, Save, X } from 'lucide-react';

const PricingSlabsConfig = ({ slabs, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempSlabs, setTempSlabs] = useState(slabs);

  const handleEdit = () => {
    setTempSlabs([...slabs]);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempSlabs([...slabs]);
    setIsEditing(false);
  };

  const handleSave = () => {
    // Validate slabs
    const sortedSlabs = tempSlabs.sort((a, b) => a.minUnits - b.minUnits);
    onUpdate(sortedSlabs);
    setIsEditing(false);
  };

  const handleAddSlab = () => {
    const lastSlab = tempSlabs[tempSlabs.length - 1];
    const newMinUnits = lastSlab?.maxUnits || 0;
    
    setTempSlabs([
      ...tempSlabs.slice(0, -1),
      { ...lastSlab, maxUnits: newMinUnits + 10 },
      {
        minUnits: newMinUnits + 10,
        maxUnits: null,
        pricePerUnit: (lastSlab?.pricePerUnit || 0) + 1
      }
    ]);
  };

  const handleRemoveSlab = (index) => {
    if (tempSlabs.length <= 1) return;
    const newSlabs = tempSlabs.filter((_, i) => i !== index);
    setTempSlabs(newSlabs);
  };

  const handleSlabChange = (index, field, value) => {
    const newSlabs = [...tempSlabs];
    newSlabs[index] = {
      ...newSlabs[index],
      [field]: field === 'pricePerUnit' ? parseFloat(value) || 0 : (value === '' ? null : parseInt(value))
    };
    setTempSlabs(newSlabs);
  };

  const displaySlabs = isEditing ? tempSlabs : slabs;

  return (
    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              Electricity Pricing Slabs
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2">
              Configure slab-based pricing for electricity units (kWh)
            </CardDescription>
          </div>
          {!isEditing ? (
            <Button 
              onClick={handleEdit}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Settings className="w-4 h-4 mr-2" />
              Edit Slabs
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Slabs Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-sm font-medium text-slate-400 pb-3 px-2">Unit Range</th>
                  <th className="text-left text-sm font-medium text-slate-400 pb-3 px-2">From (kWh)</th>
                  <th className="text-left text-sm font-medium text-slate-400 pb-3 px-2">To (kWh)</th>
                  <th className="text-left text-sm font-medium text-slate-400 pb-3 px-2">Price per Unit (₹)</th>
                  {isEditing && <th className="text-left text-sm font-medium text-slate-400 pb-3 px-2">Action</th>}
                </tr>
              </thead>
              <tbody>
                {displaySlabs.map((slab, index) => (
                  <tr key={index} className="border-b border-slate-800/50">
                    <td className="py-3 px-2 text-sm text-slate-300">
                      {slab.maxUnits ? `${slab.minUnits}-${slab.maxUnits}` : `${slab.minUnits}+`} units
                    </td>
                    <td className="py-3 px-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={slab.minUnits}
                          onChange={(e) => handleSlabChange(index, 'minUnits', e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white w-24"
                          disabled={index === 0}
                        />
                      ) : (
                        <span className="text-cyan-400">{slab.minUnits}</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={slab.maxUnits || ''}
                          placeholder="Unlimited"
                          onChange={(e) => handleSlabChange(index, 'maxUnits', e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white w-24"
                          disabled={index === displaySlabs.length - 1}
                        />
                      ) : (
                        <span className="text-cyan-400">{slab.maxUnits || 'Unlimited'}</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.1"
                          value={slab.pricePerUnit}
                          onChange={(e) => handleSlabChange(index, 'pricePerUnit', e.target.value)}
                          className="bg-slate-800 border-slate-700 text-white w-24"
                        />
                      ) : (
                        <span className="text-green-400 font-semibold">₹{slab.pricePerUnit.toFixed(2)}</span>
                      )}
                    </td>
                    {isEditing && (
                      <td className="py-3 px-2">
                        {displaySlabs.length > 1 && index !== 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveSlab(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isEditing && (
            <Button
              onClick={handleAddSlab}
              variant="outline"
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Slab
            </Button>
          )}

          {/* Example Explanation */}
          {!isEditing && (
            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-sm text-slate-400 mb-2">💡 How it works:</div>
              <ul className="text-xs text-slate-500 space-y-1">
                <li>• First {slabs[0]?.maxUnits || 0} units charged at ₹{slabs[0]?.pricePerUnit || 0}/unit</li>
                {slabs[1] && <li>• Next {slabs[1]?.maxUnits ? (slabs[1].maxUnits - slabs[1].minUnits) : 'remaining'} units charged at ₹{slabs[1].pricePerUnit}/unit</li>}
                <li>• Total cost calculated based on cumulative consumption</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingSlabsConfig;