import React from 'react';
import { useVault } from './hooks/useVault';
import { VaultLockScreen } from './components/VaultLockScreen';
import { VaultGrid } from './components/VaultGrid';

const VaultMain = () => {
  const { isUnlocked, pin, error, setPin, attemptUnlock, lockVault, docs, search, setSearch, addFiles, deleteFile } = useVault();

  return (
    <div className="h-full flex flex-col">
      {!isUnlocked ? (
        <VaultLockScreen 
          pin={pin} 
          setPin={setPin} 
          onSubmit={attemptUnlock} 
          error={error} 
        />
      ) : (
        <VaultGrid 
          docs={docs} 
          search={search} 
          setSearch={setSearch} 
          onUpload={addFiles} 
          onLock={lockVault} 
          onDelete={deleteFile} 
        />
      )}
    </div>
  );
};

export default VaultMain;