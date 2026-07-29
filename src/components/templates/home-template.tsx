"use client";

import React from 'react';
import Template1 from '@/components/templates/template1';
import { Agent } from '@/lib/agents';

interface HomeTemplateProps {
  agent: Agent;
  sectionsData?: Record<string, any>;
}

export default function HomeTemplate({ agent, sectionsData }: HomeTemplateProps) {
  return <Template1 agent={agent} sectionsData={sectionsData} />;
}
