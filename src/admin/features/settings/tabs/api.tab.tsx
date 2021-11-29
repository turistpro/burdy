import React from 'react';
import Heading from '@admin/components/heading';
import { composeWrappers } from '@admin/helpers/hoc';
import { BackupContextProvider } from '@admin/features/backup/context/backup.context';
import BackupCommandBar from '@admin/features/backup/components/backup-command-bar';
import BackupList from '@admin/features/backup/components/backup-list';

const ApiSettings = () => {
  return (
    <div>
      <Heading title="Access Tokens" noPadding>
        Generate and delete access tokens which are used
      </Heading>
      <BackupCommandBar />
      <BackupList />
    </div>
  );
};

export default composeWrappers({
  backupContext: BackupContextProvider,
})(ApiSettings);
