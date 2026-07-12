#!/usr/bin/env node
/**
 * Seeds the hidden demo tenant "Client Testing Company" with comprehensive dummy data.
 *
 * Usage: npm run seed:demo
 */

import { PrismaClient } from "@prisma/client";

const DEMO_SLUG = "client-testing-company";
const DEMO_CONTRACT_ID = "CLIENTTST01";
const DEMO_NAME = "Client Testing Company";
const DEMO_ORG_ID = "demo:client-testing-company";
const DIALER_NUMBER = "+919876543210";

const prisma = new PrismaClient();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function hoursFromNow(n) {
  const d = new Date();
  d.setHours(d.getHours() + n);
  return d;
}

const BRANCHES = [
  {
    key: "downtown",
    name: "Downtown Office",
    status: "ACTIVE",
    address: "42 Marine Drive, Mumbai, Maharashtra 400002",
    phone: "+912244556677",
    email: "downtown@clienttesting.com",
    aiEnabled: true,
    systemPrompt: "You are a helpful real estate assistant for the Downtown Mumbai office.",
  },
  {
    key: "north",
    name: "North Branch",
    status: "ACTIVE",
    address: "15 Connaught Place, New Delhi, Delhi 110001",
    phone: "+911198765432",
    email: "north@clienttesting.com",
    aiEnabled: true,
    systemPrompt: "You qualify inbound leads for the North Delhi branch.",
  },
  {
    key: "south",
    name: "South Branch",
    status: "ARCHIVED",
    address: "88 MG Road, Bengaluru, Karnataka 560001",
    phone: "+918012345678",
    email: "south@clienttesting.com",
    aiEnabled: false,
    systemPrompt: null,
  },
];

const EMPLOYEES = [
  { key: "admin", firstName: "Priya", lastName: "Sharma", email: "priya.sharma@clienttesting.com", role: "ADMIN", branchAccessType: "ALL" },
  { key: "manager", firstName: "Rahul", lastName: "Verma", email: "rahul.verma@clienttesting.com", role: "MANAGER", branchAccessType: "SELECTED", branchKeys: ["downtown", "north"] },
  { key: "agent1", firstName: "Anita", lastName: "Desai", email: "anita.desai@clienttesting.com", role: "AGENT", branchAccessType: "SELECTED", branchKeys: ["downtown"] },
  { key: "agent2", firstName: "Vikram", lastName: "Singh", email: "vikram.singh@clienttesting.com", role: "AGENT", branchAccessType: "SELECTED", branchKeys: ["north"] },
  { key: "sales", firstName: "Meera", lastName: "Iyer", email: "meera.iyer@clienttesting.com", role: "SALES", branchAccessType: "ALL" },
  { key: "support", firstName: "Arjun", lastName: "Kapoor", email: "arjun.kapoor@clienttesting.com", role: "SUPPORT", branchAccessType: "SELECTED", branchKeys: ["downtown"] },
];

const AGENTS = [
  { key: "outbound", name: "Outbound Sales Agent", type: "OUTBOUND", status: "ACTIVE", branchKey: "downtown" },
  { key: "qualifier", name: "Lead Qualifier", type: "INBOUND", status: "ACTIVE", branchKey: "north" },
  { key: "followup", name: "Follow-up Agent", type: "OUTBOUND", status: "INACTIVE", branchKey: "downtown" },
];

const PIPELINE_STAGES = [
  { slug: "new", name: "New", order: 1, isDefault: true },
  { slug: "contacted", name: "Contacted", order: 2 },
  { slug: "qualified", name: "Qualified", order: 3 },
  { slug: "won", name: "Won", order: 4, isClosed: true },
];

const LEADS = [
  { phone: "+919800000001", firstName: "Aarav", lastName: "Mehta", email: "aarav.mehta@example.com", temperature: "HOT", stageSlug: "qualified", branchKey: "downtown" },
  { phone: "+919800000002", firstName: "Isha", lastName: "Reddy", email: "isha.reddy@example.com", temperature: "HOT", stageSlug: "contacted", branchKey: "north" },
  { phone: "+919800000003", firstName: "Kabir", lastName: "Malhotra", email: "kabir.m@example.com", temperature: "WARM", stageSlug: "new", branchKey: "downtown" },
  { phone: "+919800000004", firstName: "Sneha", lastName: "Pillai", email: "sneha.p@example.com", temperature: "WARM", stageSlug: "contacted", branchKey: "north" },
  { phone: "+919800000005", firstName: "Rohan", lastName: "Bose", email: "rohan.bose@example.com", temperature: "COLD", stageSlug: "new", branchKey: "downtown" },
  { phone: "+919800000006", firstName: "Nisha", lastName: "Gupta", email: "nisha.g@example.com", temperature: "HOT", stageSlug: "won", branchKey: "north" },
  { phone: "+919800000007", firstName: "Dev", lastName: "Chatterjee", email: "dev.c@example.com", temperature: "WARM", stageSlug: "qualified", branchKey: "downtown" },
  { phone: "+919800000008", firstName: "Kavya", lastName: "Nair", email: "kavya.n@example.com", temperature: "COLD", stageSlug: "new", branchKey: "north" },
  { phone: "+919800000009", firstName: "Aditya", lastName: "Joshi", email: "aditya.j@example.com", temperature: "HOT", stageSlug: "contacted", branchKey: "downtown" },
  { phone: "+919800000010", firstName: "Pooja", lastName: "Agarwal", email: "pooja.a@example.com", temperature: "WARM", stageSlug: "qualified", branchKey: "north" },
  { phone: "+919800000011", firstName: "Sanjay", lastName: "Rao", email: "sanjay.r@example.com", temperature: "COLD", stageSlug: "new", branchKey: "downtown" },
  { phone: "+919800000012", firstName: "Lakshmi", lastName: "Menon", email: "lakshmi.m@example.com", temperature: "HOT", stageSlug: "won", branchKey: "north" },
];

const CALL_LOG_SPECS = [
  { daysAgo: 1, direction: "OUTBOUND", status: "COMPLETED", outcome: "INTERESTED", duration: 245, withTranscript: true },
  { daysAgo: 1, direction: "INBOUND", status: "COMPLETED", outcome: "CALLBACK_REQUESTED", duration: 180, withTranscript: true },
  { daysAgo: 2, direction: "OUTBOUND", status: "COMPLETED", outcome: "SITE_VISIT_SCHEDULED", duration: 320, withTranscript: true },
  { daysAgo: 2, direction: "OUTBOUND", status: "MISSED", outcome: "NO_ANSWER", duration: 0 },
  { daysAgo: 3, direction: "INBOUND", status: "COMPLETED", outcome: "CONVERTED", duration: 410, withTranscript: true },
  { daysAgo: 3, direction: "OUTBOUND", status: "VOICEMAIL", outcome: null, duration: 45 },
  { daysAgo: 4, direction: "OUTBOUND", status: "COMPLETED", outcome: "NOT_INTERESTED", duration: 95 },
  { daysAgo: 5, direction: "INBOUND", status: "COMPLETED", outcome: "INTERESTED", duration: 210 },
  { daysAgo: 6, direction: "OUTBOUND", status: "FAILED", outcome: "WRONG_NUMBER", duration: 15 },
  { daysAgo: 7, direction: "OUTBOUND", status: "COMPLETED", outcome: "CALLBACK_REQUESTED", duration: 155, withTranscript: true },
  { daysAgo: 8, direction: "INBOUND", status: "COMPLETED", outcome: "INTERESTED", duration: 275 },
  { daysAgo: 10, direction: "OUTBOUND", status: "COMPLETED", outcome: "SITE_VISIT_SCHEDULED", duration: 340 },
  { daysAgo: 12, direction: "OUTBOUND", status: "MISSED", outcome: "NO_ANSWER", duration: 0 },
  { daysAgo: 14, direction: "INBOUND", status: "COMPLETED", outcome: "CONVERTED", duration: 390 },
  { daysAgo: 16, direction: "OUTBOUND", status: "COMPLETED", outcome: "INTERESTED", duration: 220 },
  { daysAgo: 18, direction: "OUTBOUND", status: "VOICEMAIL", outcome: null, duration: 30 },
  { daysAgo: 20, direction: "INBOUND", status: "COMPLETED", outcome: "CALLBACK_REQUESTED", duration: 165 },
  { daysAgo: 22, direction: "OUTBOUND", status: "COMPLETED", outcome: "NOT_INTERESTED", duration: 80 },
  { daysAgo: 25, direction: "OUTBOUND", status: "COMPLETED", outcome: "INTERESTED", duration: 290 },
  { daysAgo: 28, direction: "INBOUND", status: "COMPLETED", outcome: "SITE_VISIT_SCHEDULED", duration: 310 },
  { daysAgo: 30, direction: "OUTBOUND", status: "MISSED", outcome: "NO_ANSWER", duration: 0 },
];

const UPLOADED_CONTACTS = [
  { phone: "+919810000001", name: "Rajesh Kumar", email: "rajesh.k@example.com" },
  { phone: "+919810000002", name: "Sunita Devi", email: "sunita.d@example.com" },
  { phone: "+919810000003", name: "Mohit Saxena", email: "mohit.s@example.com" },
  { phone: "+919810000004", name: "Deepa Krishnan", email: "deepa.k@example.com" },
  { phone: "+919810000005", name: "Tarun Bhatia", email: "tarun.b@example.com" },
];

const SAMPLE_TRANSCRIPT = {
  segments: [
    { speaker: "agent", text: "Hello, this is PropNex calling about your property inquiry.", startMs: 0, endMs: 4200 },
    { speaker: "customer", text: "Yes, I was looking at the 2BHK in Andheri.", startMs: 4500, endMs: 8900 },
    { speaker: "agent", text: "Great! I can schedule a site visit this weekend. Would Saturday work?", startMs: 9200, endMs: 14000 },
    { speaker: "customer", text: "Saturday afternoon would be perfect.", startMs: 14300, endMs: 17000 },
  ],
  fullText:
    "Agent: Hello, this is PropNex calling about your property inquiry.\nCustomer: Yes, I was looking at the 2BHK in Andheri.\nAgent: Great! I can schedule a site visit this weekend. Would Saturday work?\nCustomer: Saturday afternoon would be perfect.",
};

async function upsertCompany() {
  let company = await prisma.company.findUnique({ where: { slug: DEMO_SLUG } });

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: DEMO_NAME,
        slug: DEMO_SLUG,
        contractId: DEMO_CONTRACT_ID,
        isDemo: true,
        ownerUserId: null,
        clerkOrganizationId: DEMO_ORG_ID,
        primaryUseCase: "LEAD_QUALIFICATION",
        callVolume: "RANGE_100_500",
      },
    });
  } else {
    company = await prisma.company.update({
      where: { id: company.id },
      data: {
        name: DEMO_NAME,
        contractId: DEMO_CONTRACT_ID,
        isDemo: true,
        ownerUserId: null,
        clerkOrganizationId: DEMO_ORG_ID,
      },
    });
  }

  return company;
}

async function seedCoreConfig(companyId) {
  await prisma.creditBalance.upsert({
    where: { companyId },
    update: { creditsRemaining: 50_000, creditsUsed: 12_500 },
    create: { companyId, creditsRemaining: 50_000, creditsUsed: 12_500 },
  });

  await prisma.companySetupConfig.upsert({
    where: { companyId },
    update: { totalChannels: 5, agentsAllocated: 3, pulseTimeSeconds: 60, deltaSeconds: 2 },
    create: { companyId, totalChannels: 5, agentsAllocated: 3, pulseTimeSeconds: 60, deltaSeconds: 2 },
  });

  await prisma.companyBillingRates.upsert({
    where: { companyId },
    update: { costPerCredit: 0.31, pulseTimeSeconds: 60 },
    create: { companyId, costPerCredit: 0.31, pulseTimeSeconds: 60 },
  });

  await prisma.companyContact.upsert({
    where: { companyId },
    update: { name: "Demo Admin", email: "demo@clienttesting.com", phone: "+919000000001", title: "Demo POC" },
    create: { companyId, name: "Demo Admin", email: "demo@clienttesting.com", phone: "+919000000001", title: "Demo POC" },
  });
}

async function seedBranches(companyId) {
  const branchMap = {};

  for (const spec of BRANCHES) {
    const existing = await prisma.branch.findFirst({
      where: { companyId, name: spec.name },
    });

    const branch = existing
      ? await prisma.branch.update({
          where: { id: existing.id },
          data: {
            status: spec.status,
            address: spec.address,
            phone: spec.phone,
            email: spec.email,
            aiEnabled: spec.aiEnabled,
            systemPrompt: spec.systemPrompt,
            lastActivityAt: daysAgo(1),
          },
        })
      : await prisma.branch.create({
          data: {
            companyId,
            name: spec.name,
            status: spec.status,
            address: spec.address,
            phone: spec.phone,
            email: spec.email,
            aiEnabled: spec.aiEnabled,
            systemPrompt: spec.systemPrompt,
            lastActivityAt: daysAgo(1),
          },
        });

    branchMap[spec.key] = branch;

    const activityTypes = [
      { type: "branch.created", summary: `${spec.name} was created` },
      { type: "branch.ai_enabled", summary: spec.aiEnabled ? "AI agent enabled for this branch" : "AI agent disabled for this branch" },
    ];

    for (const activity of activityTypes) {
      const found = await prisma.branchActivity.findFirst({
        where: { branchId: branch.id, type: activity.type },
      });
      if (!found) {
        await prisma.branchActivity.create({
          data: {
            companyId,
            branchId: branch.id,
            type: activity.type,
            summary: activity.summary,
          },
        });
      }
    }
  }

  return branchMap;
}

async function seedEmployees(companyId, branchMap) {
  const userMap = {};

  for (const spec of EMPLOYEES) {
    const clerkUserId = `demo:employee-${spec.key}`;

    const user = await prisma.user.upsert({
      where: { clerkUserId },
      update: {
        firstName: spec.firstName,
        lastName: spec.lastName,
        email: spec.email,
        phone: `+9199${String(EMPLOYEES.indexOf(spec) + 1).padStart(7, "0")}`,
      },
      create: {
        clerkUserId,
        email: spec.email,
        firstName: spec.firstName,
        lastName: spec.lastName,
        phone: `+9199${String(EMPLOYEES.indexOf(spec) + 1).padStart(7, "0")}`,
      },
    });

    userMap[spec.key] = user;

    const member = await prisma.companyMember.upsert({
      where: { companyId_userId: { companyId, userId: user.id } },
      update: {
        role: spec.role,
        status: "ACTIVE",
        branchAccessType: spec.branchAccessType,
        jobTitle: spec.role.charAt(0) + spec.role.slice(1).toLowerCase(),
      },
      create: {
        companyId,
        userId: user.id,
        role: spec.role,
        status: "ACTIVE",
        branchAccessType: spec.branchAccessType,
        jobTitle: spec.role.charAt(0) + spec.role.slice(1).toLowerCase(),
        joinedAt: daysAgo(90),
      },
    });

    if (spec.branchAccessType === "SELECTED" && spec.branchKeys) {
      await prisma.memberBranchAccess.deleteMany({ where: { memberId: member.id } });
      for (const branchKey of spec.branchKeys) {
        await prisma.memberBranchAccess.upsert({
          where: { memberId_branchId: { memberId: member.id, branchId: branchMap[branchKey].id } },
          update: {},
          create: { memberId: member.id, branchId: branchMap[branchKey].id },
        });
      }
    }
  }

  return userMap;
}

async function seedAgents(companyId, branchMap) {
  const agentMap = {};

  for (const spec of AGENTS) {
    const existing = await prisma.aiAgent.findFirst({
      where: { companyId, name: spec.name },
    });

    const agent = existing
      ? await prisma.aiAgent.update({
          where: { id: existing.id },
          data: {
            type: spec.type,
            status: spec.status,
            branchId: branchMap[spec.branchKey].id,
            enabled: spec.status === "ACTIVE",
          },
        })
      : await prisma.aiAgent.create({
          data: {
            companyId,
            name: spec.name,
            type: spec.type,
            status: spec.status,
            branchId: branchMap[spec.branchKey].id,
            enabled: spec.status === "ACTIVE",
            description: `Demo ${spec.name} for client testing`,
            firstMessage: "Hello! How can I help you today?",
          },
        });

    agentMap[spec.key] = agent;
  }

  return agentMap;
}

async function seedPipelineAndLeads(companyId, branchMap, agentMap, userMap) {
  const stageMap = {};

  for (const spec of PIPELINE_STAGES) {
    const stage = await prisma.leadPipelineStage.upsert({
      where: { companyId_slug: { companyId, slug: spec.slug } },
      update: { name: spec.name, order: spec.order, isDefault: spec.isDefault ?? false, isClosed: spec.isClosed ?? false },
      create: {
        companyId,
        name: spec.name,
        slug: spec.slug,
        order: spec.order,
        isDefault: spec.isDefault ?? false,
        isClosed: spec.isClosed ?? false,
      },
    });
    stageMap[spec.slug] = stage;
  }

  const leadMap = {};

  for (const spec of LEADS) {
    const existing = await prisma.lead.findFirst({
      where: { companyId, phone: spec.phone },
    });

    const lead = existing
      ? await prisma.lead.update({
          where: { id: existing.id },
          data: {
            firstName: spec.firstName,
            lastName: spec.lastName,
            email: spec.email,
            temperature: spec.temperature,
            stageId: stageMap[spec.stageSlug].id,
            branchId: branchMap[spec.branchKey].id,
            assignedUserId: userMap.agent1.id,
            assignedAiAgentId: agentMap.outbound.id,
            score: spec.temperature === "HOT" ? 85 : spec.temperature === "WARM" ? 55 : 25,
            lastContactedAt: daysAgo(2),
          },
        })
      : await prisma.lead.create({
          data: {
            companyId,
            stageId: stageMap[spec.stageSlug].id,
            firstName: spec.firstName,
            lastName: spec.lastName,
            email: spec.email,
            phone: spec.phone,
            temperature: spec.temperature,
            branchId: branchMap[spec.branchKey].id,
            assignedUserId: userMap.agent1.id,
            assignedAiAgentId: agentMap.outbound.id,
            score: spec.temperature === "HOT" ? 85 : spec.temperature === "WARM" ? 55 : 25,
            lastContactedAt: daysAgo(2),
            queueStatus: "PENDING",
          },
        });

    leadMap[spec.phone] = lead;
  }

  return { stageMap, leadMap };
}

async function seedPhoneNumbersAndChannel(companyId, agentMap) {
  const phoneSpecs = [
    { number: "+919876543210", label: "Main Sales Line" },
    { number: "+919876543211", label: "Support Line" },
  ];

  const phoneMap = {};

  for (const spec of phoneSpecs) {
    const phone = await prisma.phoneNumber.upsert({
      where: { companyId_number: { companyId, number: spec.number } },
      update: {
        label: spec.label,
        status: "ACTIVE",
        provider: "PROPNEX",
        inboundAgentId: agentMap.qualifier.id,
        outboundAgentId: agentMap.outbound.id,
        inboundCallsCount: 42,
        outboundCallsCount: 128,
        lastActivityAt: daysAgo(1),
      },
      create: {
        companyId,
        number: spec.number,
        label: spec.label,
        status: "ACTIVE",
        provider: "PROPNEX",
        inboundAgentId: agentMap.qualifier.id,
        outboundAgentId: agentMap.outbound.id,
        inboundCallsCount: 42,
        outboundCallsCount: 128,
        lastActivityAt: daysAgo(1),
      },
    });
    phoneMap[spec.number] = phone;
  }

  const channel = await prisma.channel.upsert({
    where: { companyId_number: { companyId, number: DIALER_NUMBER } },
    update: { status: "AVAILABLE", aiAgentId: agentMap.outbound.id },
    create: {
      companyId,
      number: DIALER_NUMBER,
      status: "AVAILABLE",
      aiAgentId: agentMap.outbound.id,
    },
  });

  return { phoneMap, channel };
}

async function seedCallLogs(companyId, branchMap, agentMap, userMap, leadMap, phoneMap) {
  const leads = Object.values(leadMap);
  const phones = Object.values(phoneMap);
  const branches = Object.values(branchMap).filter((b) => b.status === "ACTIVE");

  let created = 0;

  for (let i = 0; i < CALL_LOG_SPECS.length; i++) {
    const spec = CALL_LOG_SPECS[i];
    const lead = leads[i % leads.length];
    const branch = branches[i % branches.length];
    const phone = phones[i % phones.length];
    const agent = i % 2 === 0 ? agentMap.outbound : agentMap.qualifier;
    const startedAt = daysAgo(spec.daysAgo);
    startedAt.setHours(9 + (i % 8), (i * 7) % 60, 0, 0);

    const existing = await prisma.callLog.findFirst({
      where: {
        companyId,
        leadId: lead.id,
        startedAt,
      },
    });

    if (existing) {
      if (spec.withTranscript) {
        await prisma.callTranscript.upsert({
          where: { callLogId: existing.id },
          update: { segments: SAMPLE_TRANSCRIPT.segments, fullText: SAMPLE_TRANSCRIPT.fullText },
          create: { callLogId: existing.id, segments: SAMPLE_TRANSCRIPT.segments, fullText: SAMPLE_TRANSCRIPT.fullText },
        });
      }
      continue;
    }

    const callLog = await prisma.callLog.create({
      data: {
        companyId,
        leadId: lead.id,
        phoneNumberId: phone.id,
        aiAgentId: agent.id,
        assignedUserId: userMap.agent1.id,
        branchId: branch.id,
        direction: spec.direction,
        status: spec.status,
        outcome: spec.outcome,
        startedAt,
        durationSeconds: spec.duration,
        creditsUsed: spec.duration > 0 ? Math.ceil(spec.duration / 60) : 0,
        cost: spec.duration > 0 ? (spec.duration / 60) * 0.31 : 0,
        provider: "PROPNEX",
        aiSummary: spec.status === "COMPLETED" ? { summary: "Customer showed interest in property viewing." } : null,
        sentiment: spec.status === "COMPLETED" ? { score: 0.72, label: "positive" } : null,
      },
    });

    if (spec.withTranscript) {
      await prisma.callTranscript.create({
        data: {
          callLogId: callLog.id,
          segments: SAMPLE_TRANSCRIPT.segments,
          fullText: SAMPLE_TRANSCRIPT.fullText,
        },
      });
    }

    created++;
  }

  return created;
}

async function seedBilling(companyId) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const subscription = await prisma.billingSubscription.upsert({
    where: { companyId },
    update: {
      planId: "pro-monthly",
      planName: "Pro Plan",
      status: "ACTIVE",
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    },
    create: {
      companyId,
      planId: "pro-monthly",
      planName: "Pro Plan",
      status: "ACTIVE",
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
    },
  });

  const invoices = [
    { externalId: "demo-inv-001", status: "PAID", amountCents: 499900, description: "Pro Plan - January", daysAgo: 60 },
    { externalId: "demo-inv-002", status: "PAID", amountCents: 499900, description: "Pro Plan - February", daysAgo: 30 },
    { externalId: "demo-inv-003", status: "OPEN", amountCents: 499900, description: "Pro Plan - March", daysAgo: 0 },
  ];

  for (const inv of invoices) {
    const issuedAt = daysAgo(inv.daysAgo);
    await prisma.billingInvoice.upsert({
      where: { externalId: inv.externalId },
      update: {
        status: inv.status,
        amountCents: inv.amountCents,
        description: inv.description,
        issuedAt,
        paidAt: inv.status === "PAID" ? issuedAt : null,
      },
      create: {
        companyId,
        subscriptionId: subscription.id,
        externalId: inv.externalId,
        status: inv.status,
        amountCents: inv.amountCents,
        currency: "INR",
        description: inv.description,
        issuedAt,
        dueAt: new Date(issuedAt.getTime() + 14 * 24 * 60 * 60 * 1000),
        paidAt: inv.status === "PAID" ? issuedAt : null,
      },
    });
  }
}

async function seedAnalytics(companyId) {
  for (let i = 0; i < 7; i++) {
    const periodStart = daysAgo(i);
    periodStart.setHours(0, 0, 0, 0);
    const periodEnd = new Date(periodStart);
    periodEnd.setHours(23, 59, 59, 999);

    const totalCalls = 15 + (i % 5) * 3;
    const connectedCalls = Math.floor(totalCalls * 0.65);

    await prisma.analyticsSnapshot.upsert({
      where: {
        companyId_granularity_periodStart_scope_scopeId: {
          companyId,
          granularity: "DAILY",
          periodStart,
          scope: "WORKSPACE",
          scopeId: "global",
        },
      },
      update: {
        metrics: {
          totalCalls,
          connectedCalls,
          conversionRate: connectedCalls / totalCalls,
          avgDurationSeconds: 185,
        },
        leadBreakdown: { hot: 4, warm: 6, cold: 3, total: 13 },
      },
      create: {
        companyId,
        granularity: "DAILY",
        periodStart,
        periodEnd,
        scope: "WORKSPACE",
        scopeId: "global",
        metrics: {
          totalCalls,
          connectedCalls,
          conversionRate: connectedCalls / totalCalls,
          avgDurationSeconds: 185,
        },
        leadBreakdown: { hot: 4, warm: 6, cold: 3, total: 13 },
      },
    });
  }
}

async function seedSchedulerEvents(companyId, leadMap, userMap) {
  const leads = Object.values(leadMap);
  const events = [
    { type: "MEETING", title: "Site visit - Andheri 2BHK", hours: 24, lead: leads[0] },
    { type: "FOLLOW_UP", title: "Follow up on pricing query", hours: 48, lead: leads[1] },
    { type: "DEMO", title: "Product demo for enterprise client", hours: 72, lead: leads[2] },
  ];

  for (const [i, spec] of events.entries()) {
    const startAt = hoursFromNow(spec.hours);
    const existing = await prisma.schedulerEvent.findFirst({
      where: { companyId, title: spec.title },
    });

    if (!existing) {
      await prisma.schedulerEvent.create({
        data: {
          companyId,
          type: spec.type,
          status: "SCHEDULED",
          title: spec.title,
          description: `Demo scheduled event ${i + 1}`,
          startAt,
          endAt: new Date(startAt.getTime() + 60 * 60 * 1000),
          timezone: "Asia/Kolkata",
          leadId: spec.lead.id,
          assignedUserId: userMap.manager.id,
        },
      });
    }
  }
}

async function seedUploadedContacts(companyId) {
  for (const spec of UPLOADED_CONTACTS) {
    await prisma.uploadedContact.upsert({
      where: { companyId_phone: { companyId, phone: spec.phone } },
      update: { name: spec.name, email: spec.email },
      create: { companyId, phone: spec.phone, name: spec.name, email: spec.email },
    });
  }
}

async function main() {
  console.log("Seeding demo company...");

  const company = await upsertCompany();
  console.log(`Company: ${company.name} (${company.id})`);

  await seedCoreConfig(company.id);
  const branchMap = await seedBranches(company.id);
  const userMap = await seedEmployees(company.id, branchMap);
  const agentMap = await seedAgents(company.id, branchMap);
  const { leadMap } = await seedPipelineAndLeads(company.id, branchMap, agentMap, userMap);
  const { phoneMap } = await seedPhoneNumbersAndChannel(company.id, agentMap);
  const callLogsCreated = await seedCallLogs(company.id, branchMap, agentMap, userMap, leadMap, phoneMap);
  await seedBilling(company.id);
  await seedAnalytics(company.id);
  await seedSchedulerEvents(company.id, leadMap, userMap);
  await seedUploadedContacts(company.id);

  console.log("");
  console.log("Demo company seeded.");
  console.log(`Contract ID: ${DEMO_CONTRACT_ID}`);
  console.log(`Company slug: ${DEMO_SLUG}`);
  console.log(`Company ID: ${company.id}`);
  console.log(`Call logs created this run: ${callLogsCreated}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
