import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Button, OutlinedInput } from '@mui/material';
import { ReactComponent as AddUserIcon } from '@/assets/icons/invite_user.svg';
import { useTranslation } from 'react-i18next';
import { NormalModal } from '@/components/_shared/modal';
import { notify } from '@/components/_shared/notify';
import { useCurrentUser, useService } from '@/components/main/app.hooks';
import { SubscriptionPlan, Workspace, WorkspaceMember } from '@/application/types';
import { useAppHandlers } from '@/components/app/app.hooks';
import { ReactComponent as TipIcon } from '@/assets/icons/warning.svg';
import { useSearchParams } from 'react-router-dom';

function InviteMember({ workspace, onClick }: { workspace: Workspace; onClick?: () => void }) {
  const { getSubscriptions } = useAppHandlers();
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const service = useService();
  const currentWorkspaceId = workspace.id;
  const [, setSearch] = useSearchParams();

  const currentUser = useCurrentUser();
  const [memberCount, setMemberCount] = React.useState<number>(0);
  const memberListRef = useRef<WorkspaceMember[]>([]);
  const isOwner = workspace.owner?.uid.toString() === currentUser?.uid.toString();

  const loadMembers = useCallback(async () => {
    try {
      if (!service || !currentWorkspaceId) return;
      memberListRef.current = await service.getWorkspaceMembers(currentWorkspaceId);
      setMemberCount(memberListRef.current.length);
    } catch (e) {
      console.error(e);
    }
  }, [currentWorkspaceId, service]);

  const [activeSubscriptionPlan, setActiveSubscriptionPaln] = React.useState<SubscriptionPlan | null>(null);

  const loadSubscription = useCallback(async () => {
    try {
      const subscriptions = await getSubscriptions?.();

      if (!subscriptions || subscriptions.length === 0) {
        setActiveSubscriptionPaln(SubscriptionPlan.Free);

        return;
      }

      const subscription = subscriptions[0];

      setActiveSubscriptionPaln(subscription?.plan || SubscriptionPlan.Free);
    } catch (e) {
      setActiveSubscriptionPaln(SubscriptionPlan.Free);
      console.error(e);
    }
  }, [getSubscriptions]);

  const isExceed = useMemo(() => {
    if (activeSubscriptionPlan === null) return false;
    if (activeSubscriptionPlan === SubscriptionPlan.Free) {
      return memberCount >= 2;
    }

    if (activeSubscriptionPlan === SubscriptionPlan.Pro) {
      return memberCount >= 10;
    }

    return false;
  }, [activeSubscriptionPlan, memberCount]);

  const handleOk = async () => {
    if (!service || !currentWorkspaceId) return;
    try {
      setLoading(true);
      const emails = value.split(',').map((e) => e.trim());

      const hadInvited = emails.filter((e) => memberListRef.current.find((m) => m.email === e));

      if (hadInvited.length > 0) {
        notify.warning(t('inviteMember.inviteAlready', { email: hadInvited[0] }));
        return;
      }

      await service.inviteMembers(currentWorkspaceId, emails);

      setOpen(false);
      notify.success(t('inviteMember.inviteSuccess'));
      // eslint-disable-next-line
    } catch (e: any) {
      notify.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setValue('');
    } else {
      void loadMembers();
      void loadSubscription();
    }
  }, [open, loadMembers, loadSubscription]);

  const handleUpgrade = useCallback(async () => {
    setSearch((prev) => {
      prev.set('action', 'change_plan');
      return prev;
    });
  }, [setSearch]);

  if (!isOwner) return null;

  return (
    <>
      <Button
        size={'small'}
        className={'justify-start px-2'}
        color={'inherit'}
        onClick={() => {
          setOpen(true);
          onClick?.();
        }}
        startIcon={<AddUserIcon />}
      >
        {t('settings.appearance.members.inviteMembers')}
      </Button>
      <NormalModal
        classes={{ container: 'items-start max-md:mt-auto max-md:items-center mt-[10%] ', paper: 'w-[500px]' }}
        open={open}
        okLoading={loading}
        okButtonProps={{
          disabled: !value || loading,
        }}
        cancelButtonProps={{
          className: 'hidden',
        }}
        onClose={() => setOpen(false)}
        title={<div className={'flex w-[320px] items-center font-medium'}>{t('inviteMember.requestInviteMembers')}</div>}
        okText={t('inviteMember.requestInvites')}
        onOk={handleOk}
      >
        <div
          style={{
            display: isExceed ? 'flex' : 'none',
          }}
          className={'mb-8 flex w-full flex-wrap items-center gap-1 overflow-hidden text-text-caption'}
        >
          <TipIcon className={'h-4 w-4 text-function-warning'} />
          {t('inviteMember.inviteFailedMemberLimit')}
          <span onClick={handleUpgrade} className={'cursor-pointer text-fill-default hover:underline'}>
            {t('inviteMember.upgrade')}
          </span>
        </div>
        <div className={'mb-1 text-xs text-text-caption'}>{t('inviteMember.emails')}</div>
        <OutlinedInput
          readOnly={isExceed}
          fullWidth={true}
          size={'small'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t('inviteMember.addEmail')}
        />
      </NormalModal>
    </>
  );
}

export default InviteMember;
