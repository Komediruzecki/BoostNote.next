export enum lngKeys {
  GeneralError = 'general.error',
  GeneralCreate = 'general.create',
  GeneralCancel = 'general.cancel',
  GeneralUpdate = 'general.update',
  GeneralAttachments = 'general.attachments',
  GeneralArchive = 'general.archive',
  GeneralSignin = 'general.signin',
  GeneralSigningIn = 'general.signingin',
  GeneralSignout = 'general.signout',
  GeneralSave = 'general.save',
  GeneralDefault = 'general.default',
  GeneralDelete = 'general.delete',
  GeneralDaily = 'general.daily',
  GeneralWeekly = 'general.weekly',
  GeneralNever = 'general.never',

  //settings
  SettingsInfo = 'settings.info',
  SettingsGeneral = 'settings.general',
  SettingsNotifications = 'settings.notifications',
  SettingsTitle = 'settings.title',
  SettingsPersonalInfo = 'settings.personalInfo',
  SettingsPreferences = 'settings.preferences',
  SettingsTeamInfo = 'settings.teamInfo',
  SettingsTeamMembers = 'settings.teamMembers',
  SettingsTeamUpgrade = 'settings.teamUpgrade',
  SettingsTeamSubscription = 'settings.teamSubscription',
  SettingsIntegrations = 'settings.integrations',
  SettingsAppFeedback = 'settings.appFeedback',
  SettingsAccount = 'settings.account',
  SettingsAccountDelete = 'settings.account.delete',
  SettingsUILanguage = 'settings.interfaceLanguage',
  SettingsApplicationTheme = 'settings.applicationTheme',
  SettingsEditorTheme = 'settings.editorTheme',
  SettingsCodeBlockTheme = 'settings.codeblockTheme',
  SettingsEditorKeyMap = 'settings.editorKeyMap',
  SettingsLight = 'settings.light',
  SettingsDark = 'settings.dark',
  SettingsNotifFrequencies = 'settings.notificationsFrequency',
  SettingsIndentType = 'settings.indentType',
  SettingsIndentSize = 'settings.indentSize',
  SettingsSpace = 'settings.space',
  SettingsSpaceDelete = 'settings.space.delete',
  SettingsSpaceDeleteWarning = 'settings.space.delete.warning',
  ManagePreferences = 'manage.preferences',
  ManageProfile = 'manage.profile',
  ManageSpaceSettings = 'manage.space.settings',
  ManageTeamMembers = 'manage.team.members',
  ManageIntegrations = 'manage.integrations',

  CurrentMembers = 'members.current',
  AddMembers = 'members.add',
  MembersAccessLevel = 'members.access.level',
  TeamCreate = 'team.create',
  TeamCreateSubtitle = 'team.create.subtitle',
  TeamName = 'team.name',
  TeamDomain = 'team.domain',
  SpaceName = 'space.name',
  SpaceDomain = 'space.domain',
  TeamDomainShow = 'team.domain.show',
  TeamDomainWarning = 'team.domain.warning',

  InviteWithOpenLink = 'invite.openlink',
  InviteEmail = 'invite.email',
  RoleMemberDescription = 'role.member.description',
  RoleAdminDescription = 'role.admin.description',
  RoleViewerDescription = 'role.viewer.description',
  RoleAdminPromote = 'role.admin.promote',
  RoleMemberChange = 'role.member.change',
  RoleViewerDemote = 'role.member.demote',
  TeamLeave = 'team.leave',
  TeamLeaveWarning = 'team.leave.warning',
  RemovingMember = 'role.member.remove',
  RemovingMemberWarning = 'role.member.remove.warning',
  CancelInvite = 'invite.cancel',
  CancelInviteOpenLinkMessage = 'invite.cancel.openlink.message',
  CancelInviteEmailMessage = 'invite.cancel.email.message',

  ExternalEntity = 'external.entity',
  ExternalEntityOpenInBrowser = 'external.entity.open.browser',
  ExternalEntityDescription = 'external.entity.description',
  ExternalEntityRequest = 'external.entity.request',

  CommunityFeedback = 'community.feedback',
  CommunityFeatureRequests = 'community.feature.requests',
  CommunityFeedbackSubtitle = 'community.feedback.subtitle',
  CommunityBugReport = 'community.bug.report',
  CommunityFeedbackSendError = 'community.feedback.send.error',
  CommunityFeedbackSendSuccess = 'community.feedback.send.success',
  CommunityFeedbackType = 'community.feedback.type',
  CommunityFeedbackFreeForm = 'community.feedback.freeform',

  ManageApi = 'manage.api',
  AccessTokens = 'tokens.access',
  CreateTokens = 'tokens.create',
  TokensName = 'tokens.name.placeholder',
  GenerateToken = 'tokens.generate',
  TokensDocumentation = 'tokens.documentation',

  SupportGuide = 'support.guide',
  SendUsAMessage = 'send.us.a.message',
  KeyboardShortcuts = 'keyboard.shortcuts',

  SettingsSubLimitTrialTitle = 'settings.sub.limit.trial.title',
  SettingsSubLimitTrialDate = 'settings.sub.limit.trial.date',
  SettingsSubLimitTrialUpgrade = 'settings.sub.limit.trial.upgrade',
  SettingsSubLimitUsed = 'settings.sub.limit.used',
  SettingsSubLimitTrialEnd = 'settings.sub.limit.trial.end',
  SettingsSubLimitUnderFreePlan = 'settings.sub.limit.free',

  PlanChoose = 'plan.choose',
  PlanDiscountUntil = 'plan.discount.until',
  PlanDiscountDetail = 'plan.discount.detail',
  PlanDiscountLabel = 'plan.discount.label',
  PlanDiscountCouponWarning = 'plan.discount.coupon.warning',
  PlanBusinessIntro = 'plan.business.intro',
  PlanBusinessLink = 'plan.business.link',
  PlanPerMember = 'plan.per.member',
  PlanPerMonth = 'plan.per.month',
  PlanFreePerk1 = 'plan.free.perk.1',
  PlanFreePerk2 = 'plan.free.perk.2',
  PlanStoragePerk = 'plan.free.perk.3',
  PlanStandardPerk1 = 'plan.standard.perk.1',
  PlanStandardPerk2 = 'plan.standard.perk.2',
  PlanStandardPerk3 = 'plan.standard.perk.3',
  PlanStandardPerk4 = 'plan.standard.perk.4',
  PlanProPerk1 = 'plan.pro.perk.1',
  PlanProPerk2 = 'plan.pro.perk.2',
  PlanProPerk3 = 'plan.pro.perk.3',
  PlanTrial = 'plan.trial',
  PlanInTrial = 'plan.in.trial',
  UpgradeSubtitle = 'plan.upgrade.subtitle',
  Viewers = 'viewers',
  Month = 'month',
  TotalMonthlyPrice = 'plan.total.monthly',
  PaymentMethod = 'payment.method',
  TrialWillBeStopped = 'trial.stopped',
  ApplyCoupon = 'coupon.apply',
  PromoCode = 'coupon.code',
  Subscribe = 'subscribe',
  PaymentMethodJpy = 'plan.method.jpy',
  UnlimitedViewers = 'viewers.unlimited',

  Back = 'back',

  members = 'members',
  Help = 'help',
  ThisSpace = 'this.space',
  ProfilePicture = 'profile.picture',
  Name = 'name',
  Logo = 'logo',
  SettingsAccountDeleteWarning = 'settings.account.delete.warning',
  FormSelectImage = 'form.image.select',
  FormChangeImage = 'form.image.change',
  Spaces = 'spaces',
  Tabs = 'tabs',
  User = 'user',
  See = 'see',
  Admin = 'members.access.level.admin',
  Member = 'members.access.level.member',
  Viewer = 'members.access.level.viewer',
  Leave = 'leave',
  Remove = 'remove',
  Copy = 'copy',
  Copied = 'copied',
  Send = 'send',
  Promote = 'promote',
  Demote = 'demote',
  Enable = 'enable',
  Disable = 'disable',
  SendMore = 'send.more',
  Show = 'show',
  Hide = 'hide',
  Save = 'save',
  Close = 'close',
  Token = 'token',
  Apply = 'apply',

  SettingsUserForum = 'settings.user.forum',
}

export type TranslationSource = {
  [key in lngKeys]: string
}
