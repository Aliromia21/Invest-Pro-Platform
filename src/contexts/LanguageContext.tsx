import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

type Language = 'en' | 'ar';
type DictValue = string | ((...args: any[]) => string);
type Dict = Record<string, { en: DictValue; ar: DictValue }>;


export const CUSTOMER_DASHBOARD_DICT: Dict = {
  // ===== Common =====
  'common.usdt': { en: 'USDT', ar: 'USDT' },
  'common.close': { en: 'Close', ar: 'إغلاق' },



  // ===== Referral Packs =====
  'referral.title': { en: 'Referral Packs', ar: 'باقات الإحالة' },
  'referral.subtitle': { en: 'Unlock bonuses as you bring more referrals.', ar: 'افتح مكافآت كلما زادت إحالاتك.' },
  'referral.yourProgress': { en: 'Your Progress', ar: 'تقدّمك' },
  'referral.activeReferrals': { en: 'Active Referrals', ar: 'الإحالات الفعّالة' },
  'referral.totalEarned': { en: 'Total Earned', ar: 'إجمالي المكتسبات' },
  'referral.commission': { en: 'Commission', ar: 'العمولة' },

  'referral.pack1': { en: 'Bronze Pack', ar: 'الباقة البرونزية' },
  'referral.pack2': { en: 'Silver Pack', ar: 'الباقة الفضية' },
  'referral.pack3': { en: 'Gold Pack', ar: 'الباقة الذهبية' },
  'referral.pack4': { en: 'VIP Pack', ar: 'باقة VIP' },

  'referral.requiredReferrals': { en: 'required referrals', ar: 'إحالات مطلوبة' },
  'referral.bonus': { en: 'Bonus', ar: 'المكافأة' },
  'referral.claimed': { en: 'Claimed', ar: 'تم التحصيل' },
  'referral.claim': { en: 'Claim Bonus', ar: 'تحصيل المكافأة' },
  'referral.locked': { en: 'Locked', ar: 'مقفلة' },

  'referral.note': {
    en: 'Bonuses are available after completing the required referrals.',
    ar: 'تتوفر المكافآت بعد إكمال عدد الإحالات المطلوب.',
  },

    // ===== Common (extended) =====
  'common.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'common.refresh': { en: 'Refresh', ar: 'تحديث' },
  'common.reload': { en: 'Reload', ar: 'إعادة تحميل' },
  'common.retry': { en: 'Retry', ar: 'إعادة المحاولة' },
  'common.submitting': { en: 'Submitting...', ar: 'جاري الإرسال...' },
  'common.processing': { en: 'Processing...', ar: 'جاري المعالجة...' },
  'common.clear': { en: 'Clear', ar: 'مسح' },

  // ===== Transactions =====
  'tx.title': { en: 'Transactions', ar: 'المعاملات' },
  'tx.loading': { en: 'Loading transactions...', ar: 'جاري تحميل المعاملات...' },
  'tx.currentBalance': { en: 'Current Balance', ar: 'الرصيد الحالي' },
  'tx.searchPlaceholder': {
    en: 'Search by id, type, amount, reference...',
    ar: 'بحث بالرقم أو النوع أو المبلغ أو المرجع...',
  },
  'tx.showing': {
    en: 'Showing {shown} of {total} transactions',
    ar: 'عرض {shown} من أصل {total} معاملة',
  },
  'tx.errors.loadFail': {
    en: 'Failed to load transactions',
    ar: 'فشل تحميل المعاملات',
  },

  // ===== Transaction Types =====
  'tx.type.deposit': { en: 'Deposit', ar: 'إيداع' },
  'tx.type.withdrawal': { en: 'Withdrawal', ar: 'سحب' },
  'tx.type.earning': { en: 'Earning', ar: 'أرباح' },
  'tx.type.reward': { en: 'Reward', ar: 'مكافأة' },
  'tx.type.investment_create': { en: 'Investment Created', ar: 'إنشاء استثمار' },

  // ===== Transaction Filters =====
  'tx.filters.all': { en: 'All', ar: 'الكل' },
  'tx.filters.deposits': { en: 'Deposits', ar: 'الإيداعات' },
  'tx.filters.withdrawals': { en: 'Withdrawals', ar: 'السحوبات' },
  'tx.filters.earnings': { en: 'Earnings', ar: 'الأرباح' },
  'tx.filters.rewards': { en: 'Rewards', ar: 'المكافآت' },
  'tx.filters.investments': { en: 'Investments', ar: 'الاستثمارات' },

  // ===== Direction =====
  'tx.dir.all': { en: 'All', ar: 'الكل' },
  'tx.dir.credit': { en: 'Credit', ar: 'إضافة' },
  'tx.dir.debit': { en: 'Debit', ar: 'خصم' },

  // ===== Table Headers =====
  'tx.table.id': { en: 'ID', ar: 'الرقم' },
  'tx.table.type': { en: 'Type', ar: 'النوع' },
  'tx.table.direction': { en: 'Direction', ar: 'الاتجاه' },
  'tx.table.amount': { en: 'Amount', ar: 'المبلغ' },
  'tx.table.balanceAfter': { en: 'Balance After', ar: 'الرصيد بعد' },
  'tx.table.reference': { en: 'Reference', ar: 'المرجع' },
  'tx.table.created': { en: 'Created', ar: 'التاريخ' },

  // ===== Empty State =====
  'tx.empty.title': { en: 'No transactions found', ar: 'لا توجد معاملات' },
  'tx.empty.subtitle': {
    en: 'Try changing filters or clearing the search.',
    ar: 'جرّب تغيير الفلاتر أو مسح البحث.',
  },

  // ===== Withdrawals =====
  'tx.withdraw.open': { en: 'Withdraw Funds', ar: 'سحب الأموال' },
  'tx.withdraw.listTitle': { en: 'Withdrawal Requests', ar: 'طلبات السحب' },
  'tx.withdraw.listSubtitle': {
    en: 'Track pending/approved/rejected requests',
    ar: 'تتبع طلبات السحب المعلقة والمقبولة والمرفوضة',
  },
  'tx.withdraw.empty': { en: 'No withdrawal requests', ar: 'لا توجد طلبات سحب' },
  'tx.withdraw.request': { en: 'Request', ar: 'طلب' },
  'tx.withdraw.address': { en: 'Address', ar: 'العنوان' },
  'tx.withdraw.txHash': { en: 'Tx Hash', ar: 'هاش العملية' },
  'tx.withdraw.note': { en: 'Note', ar: 'ملاحظة' },

  // ===== Withdraw Status =====
  'tx.withdraw.status.pending': { en: 'Pending', ar: 'قيد الانتظار' },
  'tx.withdraw.status.approved': { en: 'Approved', ar: 'مقبول' },
  'tx.withdraw.status.processing': { en: 'Processing', ar: 'قيد المعالجة' },
  'tx.withdraw.status.completed': { en: 'Completed', ar: 'مكتمل' },
  'tx.withdraw.status.rejected': { en: 'Rejected', ar: 'مرفوض' },

  // ===== Withdraw Dialog =====
  'tx.withdraw.dialogTitle': { en: 'Withdraw Funds', ar: 'سحب الأموال' },
  'tx.withdraw.amountLabel': { en: 'Amount (USDT)', ar: 'المبلغ (USDT)' },
  'tx.withdraw.amountPlaceholder': { en: 'e.g. 50', ar: 'مثال: 50' },
  'tx.withdraw.available': {
    en: 'Available: {balance} {usdt}',
    ar: 'المتاح: {balance} {usdt}',
  },
  'tx.withdraw.addressLabel': { en: 'Payout Address (TRC20)', ar: 'عنوان السحب (TRC20)' },
  'tx.withdraw.addressPlaceholder': {
    en: 'USDT TRON address',
    ar: 'عنوان USDT على شبكة ترون',
  },
  'tx.withdraw.addressHint': {
    en: 'Ensure the address is correct. Admin will review before processing.',
    ar: 'تأكد من صحة العنوان. سيتم مراجعته من قبل الإدارة قبل التنفيذ.',
  },
  'tx.withdraw.submit': { en: 'Submit Request', ar: 'إرسال الطلب' },

  // ===== Withdraw Validation =====
  'tx.withdraw.validation.amountInvalid': {
    en: 'Enter a valid withdrawal amount',
    ar: 'أدخل مبلغ سحب صحيح',
  },
  'tx.withdraw.validation.exceedsBalance': {
    en: 'Amount exceeds your current balance',
    ar: 'المبلغ أكبر من رصيدك الحالي',
  },
  'tx.withdraw.validation.addressInvalid': {
    en: 'Enter a valid payout address',
    ar: 'أدخل عنوان سحب صحيح',
  },
  'tx.withdraw.created': {
    en: 'Withdrawal request created{ref}',
    ar: 'تم إنشاء طلب السحب{ref}',
  },
  'tx.withdraw.createFail': {
    en: 'Failed to create withdrawal request',
    ar: 'فشل إنشاء طلب السحب',
  },
  // ===== Investment Packs =====
  'packs.title': { en: 'Choose Your Investment Pack', ar: 'اختر باقة الاستثمار' },
  'packs.subtitle': {
    en: 'Select the pack that best fits your investment goals',
    ar: 'اختر الباقة التي تناسب أهدافك الاستثمارية',
  },

  'packs.mostPopular': { en: 'Most Popular', ar: 'الأكثر طلباً' },

  'packs.range': { en: 'Investment Range', ar: 'نطاق الاستثمار' },
  'packs.roiLabel': { en: 'ROI', ar: 'العائد' },

  // Pack Names (optional: if you render names via keys)
  'packs.names.prime': { en: 'Prime Pack', ar: 'باقة برايم' },
  'packs.names.extra': { en: 'Extra Pack', ar: 'باقة إكسترا' },
  'packs.names.premium': { en: 'Premium Pack', ar: 'الباقة بريميوم' },
  'packs.names.elite': { en: 'Elite Pack', ar: 'باقة إيليت' },

  // Features (if you render these as translation keys)
  'packs.featureRoi': { en: 'ROI: {roi}%', ar: 'العائد: {roi}%' },
  'packs.featureDuration': { en: 'Duration: {days} days', ar: 'المدة: {days} يوم' },
  'packs.featurePayout': { en: 'Payout: {payout}', ar: 'الأرباح: {payout}' },
  'packs.featurePayoutDaily': { en: 'Payout: Daily', ar: 'الأرباح: يومياً' },
  'packs.featurePayoutEnd': { en: 'Payout: End of term', ar: 'الأرباح: نهاية المدة' },
  'packs.featureWithdrawAnytime': { en: 'Withdraw anytime', ar: 'سحب في أي وقت' },
  'packs.featureSupportIncluded': { en: 'Support included', ar: 'دعم متوفر' },

  // Buttons / states
  'packs.select': { en: 'Select Pack', ar: 'اختيار الباقة' },
  'packs.active': { en: 'Active', ar: 'مفعّلة' },
  'packs.inactive': { en: 'Inactive', ar: 'غير متاحة' },

  // --- Keys used by InvestmentPacks.tsx (these must exist, otherwise the UI shows the key name) ---
  'packs.loading': { en: 'Loading investment packs...', ar: 'جاري تحميل باقات الاستثمار...' },
  'packs.loadFail': { en: 'Failed to load investment packs', ar: 'فشل تحميل باقات الاستثمار' },

  'packs.investIn': { en: 'Invest in {pack}', ar: 'استثمار في {pack}' },
  'packs.investHint': {
    en: 'Enter the amount you want to invest (Min: {min} {usdt}, Max: {max} {usdt})',
    ar: 'أدخل مبلغ الاستثمار (الحد الأدنى: {min} {usdt}، الحد الأقصى: {max} {usdt})',
  },
  'packs.amountLabel': { en: 'Amount ({usdt})', ar: 'المبلغ ({usdt})' },
  'packs.amountPlaceholder': { en: 'e.g. 100', ar: 'مثال: 100' },
  'packs.availableBalance': {
    en: 'Available balance: {balance} {usdt}',
    ar: 'الرصيد المتاح: {balance} {usdt}',
  },
  'packs.insufficientBalance': { en: 'Insufficient balance', ar: 'الرصيد غير كافٍ' },

  'packs.dialogRoi': { en: 'ROI', ar: 'العائد' },
  'packs.dialogDuration': { en: 'Duration', ar: 'المدة' },
  'packs.dialogExpectedReturn': { en: 'Expected return', ar: 'العائد المتوقع' },
  'packs.dialogPayoutType': { en: 'Payout type', ar: 'نوع الدفع' },
  'packs.days': { en: '{days} days', ar: '{days} يوم' },

  'packs.payoutDaily': { en: 'Daily', ar: 'يومي' },
  'packs.payoutEnd': { en: 'End of term', ar: 'نهاية المدة' },
  'packs.payoutDailyShort': { en: 'Daily', ar: 'يومي' },
  'packs.payoutEndShort': { en: 'End', ar: 'نهاية' },

  'packs.confirmInvestment': { en: 'Confirm Investment', ar: 'تأكيد الاستثمار' },
  'packs.notActive': { en: 'This pack is not active', ar: 'هذه الباقة غير متاحة' },
  'packs.checkAmountAndBalance': {
    en: 'Please check the amount and your balance',
    ar: 'يرجى التأكد من المبلغ ورصيدك',
  },
  'packs.investSuccessTitle': { en: 'Investment created', ar: 'تم إنشاء الاستثمار' },
  'packs.investSuccessDesc': {
    en: '{amount} {usdt} invested in {pack}',
    ar: 'تم استثمار {amount} {usdt} في {pack}',
  },
  'packs.investFailTitle': { en: 'Investment failed', ar: 'فشل الاستثمار' },

  // Dialog
  'packs.dialog.title': { en: 'Invest in {name}', ar: 'استثمار في {name}' },
  'packs.dialog.desc': {
    en: 'Enter the amount you want to invest (Min: {min} USDT, Max: {max} USDT)',
    ar: 'أدخل مبلغ الاستثمار (الحد الأدنى: {min} USDT، الحد الأقصى: {max} USDT)',
  },
  'packs.dialog.amountLabel': { en: 'Investment Amount (USDT)', ar: 'مبلغ الاستثمار (USDT)' },
  'packs.dialog.available': { en: 'Available balance: {bal} USDT', ar: 'الرصيد المتاح: {bal} USDT' },
  'packs.dialog.insufficient': { en: 'Insufficient balance for this amount.', ar: 'الرصيد غير كافٍ لهذا المبلغ.' },

  'packs.dialog.roi': { en: 'ROI %:', ar: 'نسبة العائد:' },
  'packs.dialog.duration': { en: 'Duration:', ar: 'المدة:' },
  'packs.dialog.expected': { en: 'Expected Return (approx):', ar: 'العائد المتوقع (تقريباً):' },
  'packs.dialog.payoutType': { en: 'Payout Type:', ar: 'نوع الدفع:' },

  'packs.dialog.payoutDaily': { en: 'Daily', ar: 'يومي' },
  'packs.dialog.payoutEnd': { en: 'End of term', ar: 'نهاية المدة' },

  'packs.dialog.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'packs.dialog.confirm': { en: 'Confirm Investment', ar: 'تأكيد الاستثمار' },
  'packs.dialog.processing': { en: 'Processing...', ar: 'جاري المعالجة...' },

  // Toasts
  'packs.toast.inactive': { en: 'This pack is not active', ar: 'هذه الباقة غير متاحة' },
  'packs.toast.checkAmount': { en: 'Please check the amount and your balance.', ar: 'يرجى التأكد من المبلغ ورصيدك.' },
  'packs.toast.successTitle': { en: 'Investment created successfully', ar: 'تم إنشاء الاستثمار بنجاح' },
  'packs.toast.successDesc': { en: '{amt} USDT invested in {name}', ar: 'تم استثمار {amt} USDT في {name}' },
  'packs.toast.failTitle': { en: 'Investment failed', ar: 'فشل الاستثمار' },

  // ===== Deposits =====
  'tx.deposit.listTitle': {
    en: 'Deposit Requests',
    ar: 'طلبات الإيداع',
  },
  'tx.deposit.listSubtitle': {
    en: 'Track pending/approved/rejected deposits',
    ar: 'تتبع طلبات الإيداع المعلقة والمقبولة والمرفوضة',
  },
  'tx.deposit.empty': {
    en: 'No deposit requests',
    ar: 'لا توجد طلبات إيداع',
  },
  'tx.deposit.request': {
    en: 'Deposit Request',
    ar: 'طلب إيداع',
  },
  'tx.deposit.method': {
    en: 'Payment Method',
    ar: 'طريقة الدفع',
  },
  'tx.deposit.reviewedAt': {
    en: 'Reviewed At',
    ar: 'تاريخ المراجعة',
  },
  'tx.deposit.note': {
    en: 'Admin Note',
    ar: 'ملاحظة الإدارة',
  },

  'tx.deposit.dialogTitle': {
    en: 'Create Deposit Request',
    ar: 'إنشاء طلب إيداع',
  },
  'tx.deposit.amountLabel': {
    en: 'Amount (USDT)',
    ar: 'المبلغ (USDT)',
  },
  'tx.deposit.amountPlaceholder': {
    en: 'e.g. 100',
    ar: 'مثال: 100',
  },
  'tx.deposit.methodLabel': {
    en: 'Deposit Method',
    ar: 'طريقة الإيداع',
  },
  'tx.deposit.methodFixed': {
    en: 'USDT (TRC20)',
    ar: 'USDT (TRC20)',
  },
  'tx.deposit.proofLabel': {
    en: 'Payment Proof (Image)',
    ar: 'إثبات الدفع (صورة)',
  },
  'tx.deposit.proofHint': {
    en: 'Upload a screenshot/transaction proof.',
    ar: 'ارفع صورة إثبات الدفع (لقطة شاشة/إيصال).',
  },
  'tx.deposit.selectedFile': {
    en: 'Selected: {name}',
    ar: 'تم اختيار: {name}',
  },
  'tx.deposit.walletLabel': {
    en: 'Send USDT to this wallet (TRC20)',
    ar: 'أرسل USDT إلى هذه المحفظة (TRC20)',
  },
  'tx.deposit.walletLoading': {
    en: 'Loading wallet address…',
    ar: 'جاري تحميل عنوان المحفظة…',
  },
  'tx.deposit.copy': {
    en: 'Copy',
    ar: 'نسخ',
  },
  'tx.deposit.copied': {
    en: 'Copied',
    ar: 'تم النسخ',
  },
  'tx.deposit.submit': {
    en: 'Submit Deposit Request',
    ar: 'إرسال طلب الإيداع',
  },
  'tx.deposit.created': {
    en: 'Deposit request created ({amount} USDT)',
    ar: 'تم إنشاء طلب الإيداع ({amount} USDT)',
  },
  'tx.deposit.createFail': {
    en: 'Failed to create deposit request',
    ar: 'فشل إنشاء طلب الإيداع',
  },
  'tx.deposit.validation.amountInvalid': {
    en: 'Please enter a valid amount',
    ar: 'يرجى إدخال مبلغ صحيح',
  },
  'tx.deposit.validation.proofRequired': {
    en: 'Please upload the payment proof image',
    ar: 'يرجى رفع صورة إثبات الدفع',
  },
  'tx.deposit.validation.walletMissing': {
    en: 'Wallet address is not available right now',
    ar: 'عنوان المحفظة غير متوفر حالياً',
  },

  // ===== Deposit action label =====
  'tx.deposit.open': { en: 'Deposit Funds', ar: 'إيداع الأموال' },

  // ===== KYC (Customer) =====
  'kyc.title': { en: 'KYC Verification', ar: 'توثيق الهوية' },
  'kyc.subtitle': {
    en: 'Upload your passport image for verification. Status updates will appear here.',
    ar: 'ارفع صورة جواز السفر للتحقق. ستظهر تحديثات الحالة هنا.',
  },
  'kyc.loading': { en: 'Loading KYC status…', ar: 'جاري تحميل حالة التوثيق…' },
  'kyc.loadError': { en: 'Failed to load KYC status', ar: 'فشل تحميل حالة التوثيق' },
  'kyc.currentStatus': { en: 'Current Status', ar: 'الحالة الحالية' },
  'kyc.submitted': { en: 'Submitted', ar: 'تم الإرسال' },
  'kyc.reviewed': { en: 'Reviewed', ar: 'تمت المراجعة' },
  'kyc.notes': { en: 'Notes', ar: 'ملاحظات' },

  'kyc.status.notSubmitted': { en: 'Not submitted', ar: 'غير مُرسل' },
  'kyc.status.pending': { en: 'Pending', ar: 'قيد المراجعة' },
  'kyc.status.approved': { en: 'Approved', ar: 'مقبول' },
  'kyc.status.rejected': { en: 'Rejected', ar: 'مرفوض' },

  'kyc.msg.rejected': {
    en: 'Your KYC was rejected. Please upload a clearer passport image and resubmit.',
    ar: 'تم رفض التوثيق. يرجى رفع صورة أوضح لجواز السفر وإعادة الإرسال.',
  },
  'kyc.msg.pending': { en: 'Your KYC is under review.', ar: 'توثيقك قيد المراجعة.' },
  'kyc.msg.approved': {
    en: 'Your KYC is approved. No further action is required.',
    ar: 'تم قبول التوثيق. لا يلزم أي إجراء إضافي.',
  },

  'kyc.passportImage': { en: 'Passport Image', ar: 'صورة جواز السفر' },
  'kyc.disabledWhilePendingApproved': {
    en: 'disabled while pending/approved',
    ar: 'معطّل أثناء المراجعة/بعد القبول',
  },
  'kyc.chooseFile': { en: 'Choose file', ar: 'اختيار ملف' },
  'kyc.changeFile': { en: 'Change file', ar: 'تغيير الملف' },
  'kyc.noFileChosen': { en: 'No file chosen', ar: 'لم يتم اختيار ملف' },
  'kyc.currentFile': { en: 'Current file:', ar: 'الملف الحالي:' },
  'kyc.openFullImage': { en: 'Open full image', ar: 'فتح الصورة كاملة' },

  'kyc.notesOptional': { en: 'Notes (optional)', ar: 'ملاحظات (اختياري)' },
  'kyc.readOnlyWhilePendingApproved': {
    en: 'read-only while pending/approved',
    ar: 'للقراءة فقط أثناء المراجعة/بعد القبول',
  },
  'kyc.notesPlaceholder': {
    en: "Optional note (e.g., 'Passport image submitted')",
    ar: "ملاحظة اختيارية (مثلاً: 'تم إرسال صورة الجواز')",
  },
  'kyc.notesLockedPlaceholder': {
    en: "You can’t edit while pending/approved.",
    ar: 'لا يمكنك التعديل أثناء المراجعة/بعد القبول.',
  },

  'kyc.submit': { en: 'Submit KYC', ar: 'إرسال التوثيق' },
  'kyc.resubmit': { en: 'Resubmit KYC', ar: 'إعادة إرسال التوثيق' },
  'kyc.submitError': { en: 'Failed to submit KYC', ar: 'فشل إرسال التوثيق' },
  'kyc.alert.passportRequired': { en: 'Please upload a passport image.', ar: 'يرجى رفع صورة جواز السفر.' },

  
  'common.brand': { en: "InvestPro", ar: "InvestPro" },
  'common.back': { en: "Back", ar: "\u0631\u062c\u0648\u0639" },
  'common.submit': { en: "Submit", ar: "\u0625\u0631\u0633\u0627\u0644" },
  'common.sending': { en: "Sending...", ar: "\u062c\u0627\u0631\u064d \u0627\u0644\u0625\u0631\u0633\u0627\u0644..." },
  'common.copy': { en: "Copy", ar: "\u0646\u0633\u062e" },
  'common.copied': { en: "Copied", ar: "\u062a\u0645 \u0627\u0644\u0646\u0633\u062e" },
  'common.copyFail': { en: "Copy failed. Please try again.", ar: "\u0641\u0634\u0644 \u0627\u0644\u0646\u0633\u062e. \u062d\u0627\u0648\u0644 \u0645\u0631\u0629 \u0623\u062e\u0631\u0649." },
  'common.none': { en: "None", ar: "\u0644\u0627 \u064a\u0648\u062c\u062f" },
  'auth.backToHome': { en: "Back to Home", ar: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u0644\u0631\u0626\u064a\u0633\u064a\u0629" },
  'auth.backToLogin': { en: "Back to Login", ar: "\u0627\u0644\u0639\u0648\u062f\u0629 \u0644\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644" },
  'auth.emailLabel': { en: "Email Address", ar: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a" },
  'auth.emailPlaceholder': { en: "Enter your email", ar: "\u0623\u062f\u062e\u0644 \u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a" },
  'auth.passwordLabel': { en: "Password", ar: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" },
  'auth.passwordPlaceholder': { en: "Enter your password", ar: "\u0623\u062f\u062e\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" },
  'auth.rememberMe': { en: "Remember me", ar: "\u062a\u0630\u0643\u0631\u0646\u064a" },
  'auth.forgotPassword': { en: "Forgot Password?", ar: "\u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061f" },
  'auth.securityHint': { en: "\ud83d\udd12 Your data is encrypted and secure", ar: "\ud83d\udd12 \u0628\u064a\u0627\u0646\u0627\u062a\u0643 \u0645\u0634\u0641\u0631\u0629 \u0648\u0622\u0645\u0646\u0629" },
  'auth.signup.cta': { en: "Sign up now", ar: "\u0623\u0646\u0634\u0626 \u062d\u0633\u0627\u0628\u0627\u064b \u0627\u0644\u0622\u0646" },
  'auth.login.title': { en: "Welcome Back", ar: "\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0639\u0648\u062f\u062a\u0643" },
  'auth.login.subtitle': { en: "Login to your account to continue", ar: "\u0633\u062c\u0651\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0644\u0645\u062a\u0627\u0628\u0639\u0629 \u062d\u0633\u0627\u0628\u0643" },
  'auth.login.button': { en: "Login", ar: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644" },
  'auth.login.loading': { en: "Logging in...", ar: "\u062c\u0627\u0631\u064a \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644..." },
  'auth.login.success': { en: "Logged in successfully", ar: "\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0646\u062c\u0627\u062d" },
  'auth.login.invalidCreds': { en: "Invalid email or password", ar: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0635\u062d\u064a\u062d\u0629" },
  'auth.login.noAccount': { en: "Don't have an account?", ar: "\u0644\u064a\u0633 \u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628\u061f" },
  'auth.validation.emailRequired': { en: "Email is required", ar: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0645\u0637\u0644\u0648\u0628" },
  'auth.validation.emailInvalid': { en: "Email is invalid", ar: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u063a\u064a\u0631 \u0635\u062d\u064a\u062d" },
  'auth.validation.passwordRequired': { en: "Password is required", ar: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0637\u0644\u0648\u0628\u0629" },
  'auth.validation.passwordMin': { en: (vars: any) => `Password must be at least ${vars?.n} characters`, ar: (vars: any) => `كلمة المرور يجب ألا تقل عن ${vars?.n} أحرف` },
  'auth.forgot.title': { en: "Forgot Password?", ar: "\u0646\u0633\u064a\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631\u061f" },
  'auth.forgot.subtitle': { en: "Enter your email and we'll send you a 6-digit OTP.", ar: "\u0623\u062f\u062e\u0644 \u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0648\u0633\u0646\u0631\u0633\u0644 \u0644\u0643 \u0631\u0645\u0632 \u062a\u062d\u0642\u0642 \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645." },
  'auth.forgot.sendCode': { en: "Send Reset Code", ar: "\u0625\u0631\u0633\u0627\u0644 \u0631\u0645\u0632 \u0627\u0644\u0627\u0633\u062a\u0639\u0627\u062f\u0629" },
  'auth.forgot.verifyTitle': { en: "Enter Verification Code", ar: "\u0623\u062f\u062e\u0644 \u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u0642\u0642" },
  'auth.forgot.verifyButton': { en: "Verify Code", ar: "\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0631\u0645\u0632" },
  'auth.forgot.resetTitle': { en: "Create New Password", ar: "\u0625\u0646\u0634\u0627\u0621 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629" },
  'auth.forgot.resetSubtitle': { en: "Enter your new password below", ar: "\u0623\u062f\u062e\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629 \u0628\u0627\u0644\u0623\u0633\u0641\u0644" },
  'auth.forgot.newPassword': { en: "New Password", ar: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629" },
  'auth.forgot.newPasswordPlaceholder': { en: "Create new password", ar: "\u0623\u0646\u0634\u0626 \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u062c\u062f\u064a\u062f\u0629" },
  'auth.forgot.confirmPassword': { en: "Confirm Password", ar: "\u062a\u0623\u0643\u064a\u062f \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" },
  'auth.forgot.confirmPasswordPlaceholder': { en: "Confirm new password", ar: "\u0623\u0639\u062f \u0625\u062f\u062e\u0627\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629" },
  'auth.forgot.passwordRequirements': { en: "Password Requirements:", ar: "\u0645\u062a\u0637\u0644\u0628\u0627\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631:" },
  'auth.forgot.req.min8': { en: "\u2022 At least 8 characters long", ar: "\u2022 8 \u0623\u062d\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644" },
  'auth.forgot.req.upperLower': { en: "\u2022 Contains uppercase and lowercase letters", ar: "\u2022 \u062a\u062d\u062a\u0648\u064a \u0639\u0644\u0649 \u0623\u062d\u0631\u0641 \u0643\u0628\u064a\u0631\u0629 \u0648\u0635\u063a\u064a\u0631\u0629" },
  'auth.forgot.req.number': { en: "\u2022 Contains at least one number", ar: "\u2022 \u062a\u062d\u062a\u0648\u064a \u0639\u0644\u0649 \u0631\u0642\u0645 \u0648\u0627\u062d\u062f \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644" },
  'auth.forgot.resetting': { en: "Resetting...", ar: "\u062c\u0627\u0631\u064a \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0639\u064a\u064a\u0646..." },
  'auth.forgot.resetButton': { en: "Reset Password", ar: "\u0625\u0639\u0627\u062f\u0629 \u062a\u0639\u064a\u064a\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" },
  'auth.forgot.successTitle': { en: "Password Reset Successful!", ar: "\u062a\u0645\u062a \u0625\u0639\u0627\u062f\u0629 \u062a\u0639\u064a\u064a\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0628\u0646\u062c\u0627\u062d!" },
  'auth.forgot.successSubtitle': { en: "Your password has been reset. You can now login with your new password.", ar: "\u062a\u0645 \u062a\u063a\u064a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631. \u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u0622\u0646 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062c\u062f\u064a\u062f\u0629." },
  'auth.forgot.validation.passwordComplexity': { en: "Password must contain uppercase, lowercase, and number", ar: "\u064a\u062c\u0628 \u0623\u0646 \u062a\u062d\u062a\u0648\u064a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0639\u0644\u0649 \u062d\u0631\u0641 \u0643\u0628\u064a\u0631 \u0648\u062d\u0631\u0641 \u0635\u063a\u064a\u0631 \u0648\u0631\u0642\u0645" },
  'auth.forgot.validation.passwordsNoMatch': { en: "Passwords do not match", ar: "\u0643\u0644\u0645\u062a\u0627 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0645\u062a\u0637\u0627\u0628\u0642\u062a\u064a\u0646" },
  'auth.forgot.errors.sendFail': { en: "Failed to send OTP", ar: "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u0642\u0642" },
  'auth.forgot.errors.verifyFail': { en: "OTP verification failed", ar: "\u0641\u0634\u0644 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0631\u0645\u0632" },
  'auth.forgot.errors.resetFail': { en: "Password reset failed", ar: "\u0641\u0634\u0644 \u0625\u0639\u0627\u062f\u0629 \u062a\u0639\u064a\u064a\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" },
  'auth.forgot.toast.otpSent': { en: "If the email exists, an OTP has been sent.", ar: "\u0625\u0630\u0627 \u0643\u0627\u0646 \u0627\u0644\u0628\u0631\u064a\u062f \u0645\u0648\u062c\u0648\u062f\u0627\u064b \u0641\u0633\u064a\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0631\u0645\u0632 \u062a\u062d\u0642\u0642." },
  'auth.forgot.toast.otpVerified': { en: "OTP verified", ar: "\u062a\u0645 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0631\u0645\u0632" },
  'auth.forgot.toast.resetSuccess': { en: "Password reset successful", ar: "\u062a\u0645\u062a \u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062a\u0639\u064a\u064a\u0646 \u0628\u0646\u062c\u0627\u062d" },
  'emailVerify.title': { en: "Verify Your Email", ar: "\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a" },
  'emailVerify.sentTo': { en: "We've sent a 6-digit verification code to", ar: "\u0644\u0642\u062f \u0623\u0631\u0633\u0644\u0646\u0627 \u0631\u0645\u0632 \u062a\u062d\u0642\u0642 \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645 \u0625\u0644\u0649" },
  'emailVerify.enterCode': { en: "Enter Verification Code", ar: "\u0623\u062f\u062e\u0644 \u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u0642\u0642" },
  'emailVerify.verifyButton': { en: "Verify Email", ar: "\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0628\u0631\u064a\u062f" },
  'emailVerify.verifying': { en: "Verifying...", ar: "\u062c\u0627\u0631\u064d \u0627\u0644\u062a\u062d\u0642\u0642..." },
  'emailVerify.didntReceive': { en: "Didn't receive the code?", ar: "\u0644\u0645 \u064a\u0635\u0644\u0643 \u0627\u0644\u0631\u0645\u0632\u061f" },
  'emailVerify.resend': { en: "Resend Code", ar: "\u0625\u0639\u0627\u062f\u0629 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0645\u0632" },
  'emailVerify.resendIn': { en: (vars: any) => `Resend in ${vars?.seconds}s`, ar: (vars: any) => `إعادة الإرسال خلال ${vars?.seconds}ث` },
  'emailVerify.spamHint': { en: "\ud83d\udca1 Check your spam folder if you don't see the email", ar: "\ud83d\udca1 \u062a\u062d\u0642\u0642 \u0645\u0646 \u0645\u062c\u0644\u062f \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u063a\u064a\u0631 \u0627\u0644\u0645\u0631\u063a\u0648\u0628 \u0641\u064a\u0647\u0627 \u0625\u0630\u0627 \u0644\u0645 \u062a\u062c\u062f \u0627\u0644\u0631\u0633\u0627\u0644\u0629" },
  'emailVerify.errors.incompleteCode': { en: "Please enter the complete 6-digit code", ar: "\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u0631\u0645\u0632 \u0627\u0644\u0643\u0627\u0645\u0644 \u0627\u0644\u0645\u0643\u0648\u0651\u0646 \u0645\u0646 6 \u0623\u0631\u0642\u0627\u0645" },
  'emailVerify.alert.resendSent': { en: "A new verification code has been sent to your email!", ar: "\u062a\u0645 \u0625\u0631\u0633\u0627\u0644 \u0631\u0645\u0632 \u062a\u062d\u0642\u0642 \u062c\u062f\u064a\u062f \u0625\u0644\u0649 \u0628\u0631\u064a\u062f\u0643 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a!" },
  'emailVerify.verified.title': { en: "Email Verified!", ar: "\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u0628\u0631\u064a\u062f!" },
  'emailVerify.verified.subtitle': { en: "Your email has been successfully verified. Redirecting to dashboard...", ar: "\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0628\u0631\u064a\u062f\u0643 \u0628\u0646\u062c\u0627\u062d. \u062c\u0627\u0631\u064d \u062a\u062d\u0648\u064a\u0644\u0643 \u0625\u0644\u0649 \u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645..." },
  'ref.loading': { en: "Loading referrals...", ar: "\u062c\u0627\u0631\u064a \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0625\u062d\u0627\u0644\u0627\u062a..." },
  'ref.loadFail': { en: "Failed to load referrals data", ar: "\u0641\u0634\u0644 \u062a\u062d\u0645\u064a\u0644 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0625\u062d\u0627\u0644\u0627\u062a" },
  'ref.loadFailTitle': { en: "Failed to load referrals", ar: "\u0641\u0634\u0644 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0625\u062d\u0627\u0644\u0627\u062a" },
  'ref.noticeFirstDeposit': { en: "Your referral counter will start increasing after your first approved deposit.", ar: "\u0633\u064a\u0628\u062f\u0623 \u0639\u062f\u0627\u062f \u0627\u0644\u0625\u062d\u0627\u0644\u0627\u062a \u0628\u0627\u0644\u0632\u064a\u0627\u062f\u0629 \u0628\u0639\u062f \u0623\u0648\u0644 \u0625\u064a\u062f\u0627\u0639 \u0645\u0639\u062a\u0645\u062f." },
  'ref.stats.totalReferrals': { en: "Total Referrals", ar: "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0625\u062d\u0627\u0644\u0627\u062a" },
  'ref.stats.totalEarnings': { en: "Total Earnings", ar: "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0623\u0631\u0628\u0627\u062d" },
  'ref.stats.teamInvestment': { en: "Team Investment", ar: "\u0627\u0633\u062a\u062b\u0645\u0627\u0631 \u0627\u0644\u0641\u0631\u064a\u0642" },
  'ref.section.title': { en: "Your Referral Code", ar: "\u0643\u0648\u062f \u0627\u0644\u0625\u062d\u0627\u0644\u0629 \u0627\u0644\u062e\u0627\u0635 \u0628\u0643" },
  'ref.section.subtitle': { en: "Share your code and earn commission when referrals make their first approved deposit.", ar: "\u0634\u0627\u0631\u0643 \u0643\u0648\u062f \u0627\u0644\u0625\u062d\u0627\u0644\u0629 \u0648\u0627\u0643\u0633\u0628 \u0639\u0645\u0648\u0644\u0629 \u0639\u0646\u062f\u0645\u0627 \u064a\u0642\u0648\u0645 \u0627\u0644\u0645\u062f\u0639\u0648\u0648\u0646 \u0628\u0623\u0648\u0644 \u0625\u064a\u062f\u0627\u0639 \u0645\u0639\u062a\u0645\u062f." },
  'ref.section.codeLabel': { en: "Referral Code", ar: "\u0643\u0648\u062f \u0627\u0644\u0625\u062d\u0627\u0644\u0629" },
  'ref.section.linkLabel': { en: "Referral Link", ar: "\u0631\u0627\u0628\u0637 \u0627\u0644\u0625\u062d\u0627\u0644\u0629" },
  'ref.copy.code': { en: "Referral code copied", ar: "\u062a\u0645 \u0646\u0633\u062e \u0643\u0648\u062f \u0627\u0644\u0625\u062d\u0627\u0644\u0629" },
  'ref.copy.link': { en: "Referral link copied", ar: "\u062a\u0645 \u0646\u0633\u062e \u0631\u0627\u0628\u0637 \u0627\u0644\u0625\u062d\u0627\u0644\u0629" },
  'dash.availableBalance': { en: "Available Balance", ar: "\u0627\u0644\u0631\u0635\u064a\u062f \u0627\u0644\u0645\u062a\u0627\u062d" },
  'dash.activeInvestment': { en: "Active Investment", ar: "\u0627\u0644\u0627\u0633\u062a\u062b\u0645\u0627\u0631 \u0627\u0644\u0646\u0634\u0637" },
  'dash.totalEarnings': { en: "Total Earnings", ar: "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0623\u0631\u0628\u0627\u062d" },
  'dash.referrals': { en: "Referrals", ar: "\u0627\u0644\u0625\u062d\u0627\u0644\u0627\u062a" },
  'dash.referralCode': { en: "Your Referral Code", ar: "\u0643\u0648\u062f \u0627\u0644\u0625\u062d\u0627\u0644\u0629 \u0627\u0644\u062e\u0627\u0635 \u0628\u0643" },
  'dash.referralHint': { en: "Share your code and earn commission on referred investments!", ar: "\u0634\u0627\u0631\u0643 \u0643\u0648\u062f \u0627\u0644\u0625\u062d\u0627\u0644\u0629 \u0648\u0627\u0643\u0633\u0628 \u0639\u0645\u0648\u0644\u0629 \u0639\u0644\u0649 \u0627\u0633\u062a\u062b\u0645\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u062f\u0639\u0648\u064a\u0646!" },
  'dash.messages': { en: "Messages & Offers", ar: "\u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0648\u0627\u0644\u0639\u0631\u0648\u0636" },
  'dash.messagesHint': { en: "View special offers and tasks from admin.", ar: "\u0639\u0631\u0636 \u0627\u0644\u0639\u0631\u0648\u0636 \u0648\u0627\u0644\u0645\u0647\u0627\u0645 \u0627\u0644\u062e\u0627\u0635\u0629 \u0645\u0646 \u0627\u0644\u0625\u062f\u0627\u0631\u0629." },
  'dash.pendingTasks': { en: (vars: any) => `You have ${vars?.n} pending task(s)`, ar: (vars: any) => `لديك ${vars?.n} مهمة قيد الانتظار` },
  'dash.openMessages': { en: "Open Messages", ar: "\u0641\u062a\u062d \u0627\u0644\u0631\u0633\u0627\u0626\u0644" },
  'dash.support': { en: "Support", ar: "\u0627\u0644\u062f\u0639\u0645" },
  'dash.openSupport': { en: "Open Support", ar: "\u0641\u062a\u062d \u0627\u0644\u062f\u0639\u0645" },
  'dash.createTicket': { en: "Create Ticket", ar: "\u0625\u0646\u0634\u0627\u0621 \u062a\u0630\u0643\u0631\u0629" },
  'dash.myTickets': { en: "My Tickets", ar: "\u062a\u0630\u0627\u0643\u0631\u064a" },
  'dash.unread': { en: "Unread", ar: "\u063a\u064a\u0631 \u0645\u0642\u0631\u0648\u0621\u0629" },
  'dash.ticketCreated': { en: "Ticket created", ar: "\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062a\u0630\u0643\u0631\u0629" },
  'dash.depositWallet': { en: "Deposit Wallet", ar: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0625\u064a\u062f\u0627\u0639" },
  'dash.walletNotConfigured': { en: "Wallet not configured yet", ar: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d \u062d\u0627\u0644\u064a\u0627\u064b" },
  'dash.recentActivity': { en: "Recent Activity", ar: "\u0622\u062e\u0631 \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a" },
  'dash.noTx': { en: "No transactions yet.", ar: "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0639\u0627\u0645\u0644\u0627\u062a \u0628\u0639\u062f." },
  'dash.investmentPerformance': { en: "Investment Performance", ar: "\u0623\u062f\u0627\u0621 \u0627\u0644\u0627\u0633\u062a\u062b\u0645\u0627\u0631" },
  'dash.dailyRoi': { en: "Daily ROI", ar: "\u0627\u0644\u0639\u0627\u0626\u062f \u0627\u0644\u064a\u0648\u0645\u064a" },
  'dash.payout': { en: "Payout", ar: "\u0622\u0644\u064a\u0629 \u0627\u0644\u062f\u0641\u0639" },
  'dash.daysActive': { en: "Days Active", ar: "\u0639\u062f\u062f \u0627\u0644\u0623\u064a\u0627\u0645" },
  'dash.endDate': { en: "End", ar: "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0627\u0646\u062a\u0647\u0627\u0621" },
  'dash.totalReturns': { en: "Total Returns", ar: "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0639\u0648\u0627\u0626\u062f" },
  'dash.expected': { en: "Expected", ar: "\u0627\u0644\u0645\u062a\u0648\u0642\u0639" },
  'dash.updatedAt': { en: "Updated:", ar: "\u0622\u062e\u0631 \u062a\u062d\u062f\u064a\u062b:" },
  'dash.amount': { en: "Amount", ar: "\u0627\u0644\u0645\u0628\u0644\u063a" },
  'dash.status': { en: "Status", ar: "\u0627\u0644\u062d\u0627\u0644\u0629" },
  'dash.messagesDescription': { en: "View admin messages", ar: "\u0639\u0631\u0636 \u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0625\u062f\u0627\u0631\u0629" },
  'dash.form.name': { en: "Name", ar: "\u0627\u0644\u0627\u0633\u0645" },
  'dash.form.whatsapp': { en: "WhatsApp", ar: "\u0648\u0627\u062a\u0633\u0627\u0628" },
  'dash.form.telegram': { en: "Telegram", ar: "\u062a\u064a\u0644\u064a\u063a\u0631\u0627\u0645" },
  'dash.form.email': { en: "Email", ar: "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a" },
  'dash.form.message': { en: "Message", ar: "\u0627\u0644\u0631\u0633\u0627\u0644\u0629" },



};

type TranslateFn = (key: string, ...args: any[]) => string;

interface LanguageContextValue {
  language: Language;
  isRTL: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: TranslateFn;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('lang');
    return saved === 'ar' || saved === 'en' ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);
  const toggleLanguage = () => setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));

  const value = useMemo<LanguageContextValue>(() => {
    const isRTL = language === 'ar';

    const t: TranslateFn = (key: string, vars?: Record<string, any>) => {
  const entry = CUSTOMER_DASHBOARD_DICT[key];
  if (!entry) return String(vars?.defaultValue ?? key);

  let raw = entry[language];
  if (typeof raw === 'function') return raw(vars);

  if (vars && typeof raw === 'string') {
    Object.keys(vars).forEach((k) => {
      raw = raw.replaceAll(`{${k}}`, String(vars[k]));
    });
  }

  return raw;
};


    return { language, isRTL, setLanguage, toggleLanguage, t };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
