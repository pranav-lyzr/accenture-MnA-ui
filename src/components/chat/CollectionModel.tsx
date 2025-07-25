/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "../botton";
import { Plus, FolderOpen } from "lucide-react";

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCompanies: any[];
  onAddToCollection: (
    collectionId: string | null,
    collectionName?: string
  ) => void;
}

// Mock collections data
const mockCollections = [
  { id: "1", name: "Target Companies Q1", count: 12 },
  { id: "2", name: "SaaS Prospects", count: 8 },
  { id: "3", name: "Manufacturing Targets", count: 15 },
];

export const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  selectedCompanies,
  onAddToCollection,
}) => {
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const handleAddToExisting = (collectionId: string) => {
    onAddToCollection(collectionId);
    onClose();
  };

  const handleCreateNew = () => {
    if (newCollectionName.trim()) {
      onAddToCollection(null, newCollectionName.trim());
      setNewCollectionName("");
      setShowCreateNew(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Collection">
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Selected Companies ({selectedCompanies.length})
          </p>
          <div className="space-y-1">
            {selectedCompanies.map((company, idx) => (
              <p key={idx} className="text-sm text-gray-600">
                • {company.name}
              </p>
            ))}
          </div>
        </div>

        {!showCreateNew ? (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Add to existing collection:
              </h3>
              <div className="space-y-2">
                {mockCollections.map((collection) => (
                  <button
                    key={collection.id}
                    onClick={() => handleAddToExisting(collection.id)}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FolderOpen className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {collection.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {collection.count} companies
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-3">
              <Button
                onClick={() => setShowCreateNew(true)}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Collection
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Collection Name
              </label>
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Enter collection name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreateNew}
                disabled={!newCollectionName.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                Create & Add
              </Button>
              <Button
                onClick={() => setShowCreateNew(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
