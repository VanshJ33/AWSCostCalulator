import React, { useState, useMemo } from 'react';
import { Users, Code, Brain, Server, Clock, DollarSign, Cloud, CheckCircle2, AlertCircle } from 'lucide-react';

const App = () => {
  const [timeline, setTimeline] = useState(6);
  const [teamQuality, setTeamQuality] = useState('mid');
  const [userBase, setUserBase] = useState(200);
  
  const [scope, setScope] = useState({
    backendServices: 60,
    frontendServices: 10,
    aiAgents: 20,
    generativeAI: 5,
    separateServices: 10
  });

  const [awsServices, setAwsServices] = useState({
    ec2: true,
    rds: true,
    redis: true,
    s3: true,
    apiGateway: true,
    vpc: true,
    cognito: true,
    sns: true,
    sqs: true,
    elb: true,
    cloudwatch: true
  });

  const toggleAwsService = (service) => {
    setAwsServices({ ...awsServices, [service]: !awsServices[service] });
  };

  const updateScope = (field, value) => {
    setScope({ ...scope, [field]: parseInt(value) || 0 });
  };

  const calculateTeam = () => {
    const efforts = {
      backendDev: scope.backendServices * 0.75,
      frontendDev: scope.frontendServices * 1.5,
      aiAgentDev: scope.aiAgents * 2,
      genAIDev: scope.generativeAI * 3,
      separateServices: scope.separateServices * 1,
      testing: 0
    };

    efforts.testing = (efforts.backendDev + efforts.frontendDev + efforts.aiAgentDev + efforts.genAIDev + efforts.separateServices) * 0.2;
    const totalEffort = Object.values(efforts).reduce((a, b) => a + b, 0);
    const qualityMultiplier = { junior: 1.5, mid: 1.0, senior: 0.75 };
    const adjustedEffort = totalEffort * qualityMultiplier[teamQuality];
    const teamSize = Math.ceil(adjustedEffort / timeline);
    
    const team = {
      backendDevs: Math.max(1, Math.ceil(teamSize * 0.25)),
      frontendDevs: Math.max(1, Math.ceil(teamSize * 0.1)),
      aiEngineers: Math.max(1, Math.ceil(teamSize * 0.3)),
      devopsEngineers: Math.max(2, Math.min(3, Math.ceil(teamSize * 0.08))),
      qaEngineers: Math.max(1, Math.ceil(teamSize * 0.15)),
      techLeads: teamQuality === 'senior' ? 1 : 2,
      projectManagers: 1,
      total: 0
    };
    team.total = Object.values(team).reduce((a, b) => a + b, 0) - team.total;
    return { team };
  };

  const calculateAWSCosts = () => {
    const costs = {
      ec2: awsServices.ec2 ? (userBase <= 100 ? 2 * 0.0832 * 730 : 2 * 0.1664 * 730) : 0,
      rds: awsServices.rds ? (2 * (userBase <= 200 ? 0.136 : 0.24) * 730 + 200 * 0.115) : 0,
      redis: awsServices.redis ? ((userBase <= 200 ? 1 : 2) * (userBase <= 100 ? 0.017 : 0.034) * 730) : 0,
      s3: awsServices.s3 ? ((userBase <= 100 ? 50 : userBase <= 200 ? 100 : 200) * 0.023) : 0,
      apiGateway: awsServices.apiGateway ? ((userBase * 1000 / 1000000) * 3.50) : 0,
      vpc: awsServices.vpc ? (0.045 * 730 + (userBase / 10) * 0.045 + 0.01 * 730 * 3) : 0,
      cognito: awsServices.cognito ? (userBase > 50000 ? (userBase - 50000) * 0.0055 : 0) : 0,
      sns: awsServices.sns ? ((userBase * 100) > 1000000 ? (((userBase * 100) - 1000000) / 1000000) * 0.50 : 0) : 0,
      sqs: awsServices.sqs ? ((userBase * 500) > 1000000 ? (((userBase * 500) - 1000000) / 1000000) * 0.40 : 0) : 0,
      elb: awsServices.elb ? (0.0225 * 730) : 0,
      cloudwatch: awsServices.cloudwatch ? 50 : 0
    };
    
    costs.total = Object.values(costs).reduce((a, b) => a + b, 0);
    return costs;
  };

  const calculateAzureCosts = () => {
    const aciInstances = Math.max(3, Math.ceil(scope.aiAgents / 5));
    const aciCost = aciInstances * 0.0000125 * 2 * 1024 * 730;
    const openAICost = (scope.generativeAI * 10000000 / 1000) * 0.002;
    const cognitiveServicesCost = scope.generativeAI * 100;
    const aiSearchCost = 250;
    const cosmosDBCost = 200;
    const otherCost = 150 + 50 + 80 + (scope.aiAgents > 10 ? 100 : 50);
    const azureTotal = aciCost + openAICost + cognitiveServicesCost + aiSearchCost + cosmosDBCost + otherCost;
    return { aci: aciCost, openAI: openAICost, cognitiveServices: cognitiveServicesCost, aiSearch: aiSearchCost, cosmosDB: cosmosDBCost, total: azureTotal };
  };

  // Use useMemo to automatically recalculate when dependencies change
  const results = useMemo(() => calculateTeam(), [scope, teamQuality, timeline]);
  const awsCosts = useMemo(() => calculateAWSCosts(), [awsServices, userBase]);
  const azureCosts = useMemo(() => calculateAzureCosts(), [scope]);

  const salaryCosts = {
    junior: { backendDev: 50000, frontendDev: 45000, aiEngineer: 70000, devops: 60000, qa: 40000, techLead: 120000, pm: 100000 },
    mid: { backendDev: 80000, frontendDev: 75000, aiEngineer: 120000, devops: 90000, qa: 60000, techLead: 180000, pm: 150000 },
    senior: { backendDev: 150000, frontendDev: 130000, aiEngineer: 200000, devops: 140000, qa: 90000, techLead: 250000, pm: 200000 }
  };

  // Use useMemo for all derived calculations so they update automatically
  const costs = useMemo(() => salaryCosts[teamQuality], [teamQuality]);
  
  const monthlySalaryCost = useMemo(() => 
    results.team.backendDevs * costs.backendDev + 
    results.team.frontendDevs * costs.frontendDev + 
    results.team.aiEngineers * costs.aiEngineer + 
    results.team.devopsEngineers * costs.devops + 
    results.team.qaEngineers * costs.qa + 
    results.team.techLeads * costs.techLead + 
    results.team.projectManagers * costs.pm,
    [results.team, costs]
  );
  
  const monthlyInfraCost = useMemo(() => awsCosts.total + azureCosts.total, [awsCosts.total, azureCosts.total]);
  const totalMonthlyCost = useMemo(() => monthlySalaryCost + monthlyInfraCost, [monthlySalaryCost, monthlyInfraCost]);
  const totalProjectCost = useMemo(() => totalMonthlyCost * timeline, [totalMonthlyCost, timeline]);
  const maintenanceCost = useMemo(() => monthlySalaryCost * 0.3 + monthlyInfraCost, [monthlySalaryCost, monthlyInfraCost]);
  const totalServices = useMemo(() => scope.backendServices + scope.frontendServices + scope.separateServices, [scope]);

  const awsServicesList = [
    { 
      key: 'ec2', 
      name: 'EC2 Instances', 
      required: true, 
      freeTier: '750 hrs/month for 12 months (t2.micro/t3.micro)',
      freeNote: 'Free for first year with t2.micro/t3.micro instances only'
    },
    { 
      key: 'rds', 
      name: 'RDS Database', 
      required: false, 
      freeTier: '750 hrs/month for 12 months (db.t2.micro)',
      freeNote: 'Free for ~100-500 users in first year with db.t2.micro'
    },
    { 
      key: 'redis', 
      name: 'ElastiCache Redis', 
      required: false, 
      freeTier: '750 hrs/month for 12 months (cache.t2.micro)',
      freeNote: 'Free for ~500 users in first year with cache.t2.micro'
    },
    { 
      key: 's3', 
      name: 'S3 Storage', 
      required: false, 
      freeTier: '5 GB storage, 20K GET, 2K PUT/month',
      freeNote: 'Free for ~50-100 users forever (5GB = ~50 users @ 100MB/user)'
    },
    { 
      key: 'apiGateway', 
      name: 'API Gateway', 
      required: false, 
      freeTier: '1M API calls/month for 12 months',
      freeNote: 'Free for ~1,000 users in first year (1000 calls/user/month)'
    },
    { 
      key: 'vpc', 
      name: 'VPC (NAT + Endpoints)', 
      required: false, 
      freeTier: null,
      freeNote: 'No free tier - costs apply for all users'
    },
    { 
      key: 'cognito', 
      name: 'Cognito Auth', 
      required: false, 
      freeTier: '50,000 MAU forever',
      freeNote: 'FREE for up to 50,000 active users per month (FOREVER)'
    },
    { 
      key: 'sns', 
      name: 'SNS (Notifications)', 
      required: false, 
      freeTier: '1M publishes/month',
      freeNote: 'Free for ~10,000 users (100 notifications/user/month)'
    },
    { 
      key: 'sqs', 
      name: 'SQS (Queue)', 
      required: false, 
      freeTier: '1M requests/month',
      freeNote: 'Free for ~2,000 users (500 requests/user/month)'
    },
    { 
      key: 'elb', 
      name: 'Load Balancer', 
      required: false, 
      freeTier: '750 hrs/month for 12 months (15GB traffic)',
      freeNote: 'Free for first year with minimal traffic'
    },
    { 
      key: 'cloudwatch', 
      name: 'CloudWatch', 
      required: false, 
      freeTier: '10 metrics, 1M API requests',
      freeNote: 'Basic monitoring free, advanced costs ~$50/mo'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Users className="w-8 h-8 text-purple-600" />
            AWS + Azure Team Calculator
          </h1>
          <p className="text-gray-600 text-sm">Configure your project scope and get instant team size, costs, and cloud estimates</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-5">
            <h2 className="text-lg font-bold mb-4">🎯 Project Scope</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Server className="w-4 h-4 inline mr-1" />
                  Backend Services: {scope.backendServices}
                </label>
                <input type="range" min="0" max="100" value={scope.backendServices} onChange={(e) => updateScope('backendServices', e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Code className="w-4 h-4 inline mr-1" />
                  Frontend Services: {scope.frontendServices}
                </label>
                <input type="range" min="0" max="20" value={scope.frontendServices} onChange={(e) => updateScope('frontendServices', e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Brain className="w-4 h-4 inline mr-1" />
                  AI Agents: {scope.aiAgents}
                </label>
                <input type="range" min="0" max="50" value={scope.aiAgents} onChange={(e) => updateScope('aiAgents', e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Brain className="w-4 h-4 inline mr-1" />
                  Generative AI: {scope.generativeAI}
                </label>
                <input type="range" min="0" max="10" value={scope.generativeAI} onChange={(e) => updateScope('generativeAI', e.target.value)} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Server className="w-4 h-4 inline mr-1" />
                  Separate Services: {scope.separateServices}
                </label>
                <input type="range" min="0" max="20" value={scope.separateServices} onChange={(e) => updateScope('separateServices', e.target.value)} className="w-full" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5">
            <h2 className="text-lg font-bold mb-4">⚙️ Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Timeline: {timeline} months
                </label>
                <input type="range" min="3" max="24" value={timeline} onChange={(e) => setTimeline(parseInt(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Team Quality</label>
                <select value={teamQuality} onChange={(e) => setTeamQuality(e.target.value)} className="w-full p-2 border rounded">
                  <option value="junior">Junior (₹40-70K)</option>
                  <option value="mid">Mid-level (₹60-120K)</option>
                  <option value="senior">Senior (₹90-200K)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Expected Users: {userBase}
                </label>
                <input type="range" min="50" max="5000" step="50" value={userBase} onChange={(e) => setUserBase(parseInt(e.target.value))} className="w-full" />
                <p className="text-xs text-gray-500 mt-1">Affects AWS service sizing and costs</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Cloud className="w-6 h-6 text-orange-600" />
              <h2 className="text-lg font-bold">AWS Services</h2>
            </div>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {awsServicesList.map((service) => {
                const cost = awsCosts[service.key] || 0;
                const isFree = service.freeTier && (
                  (service.key === 'ec2' && userBase <= 100) ||
                  (service.key === 'rds' && userBase <= 500) ||
                  (service.key === 'redis' && userBase <= 500) ||
                  (service.key === 's3' && userBase <= 100) ||
                  (service.key === 'apiGateway' && userBase <= 1000) ||
                  (service.key === 'cognito' && userBase <= 50000) ||
                  (service.key === 'sns' && userBase <= 10000) ||
                  (service.key === 'sqs' && userBase <= 2000) ||
                  (service.key === 'elb' && userBase <= 100) ||
                  (service.key === 'cloudwatch')
                );
                
                const status = !awsServices[service.key] ? { icon: '⚫', color: 'text-gray-400', label: 'Disabled' } :
                              isFree ? { icon: '🟢', color: 'text-green-600', label: 'FREE' } :
                              cost < 50 ? { icon: '🟡', color: 'text-yellow-600', label: 'Low' } :
                              { icon: '🔴', color: 'text-red-600', label: 'Paid' };

                return (
                  <div key={service.key} className={`border rounded-lg p-2 transition-all ${awsServices[service.key] ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-start gap-2 flex-1">
                        <input type="checkbox" checked={awsServices[service.key]} onChange={() => toggleAwsService(service.key)} disabled={service.required} className="mt-1" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm block">{service.name}</span>
                          {service.freeTier && (
                            <div className="text-xs text-gray-600 mt-0.5">
                              <div className="flex items-center gap-1">
                                {status.icon}
                                <span className={`font-semibold ${status.color}`}>{status.label}</span>
                              </div>
                              {isFree && service.freeNote && (
                                <div className="text-green-700 mt-1 text-xs">
                                  ✓ {service.freeNote}
                                </div>
                              )}
                            </div>
                          )}
                          {awsServices[service.key] && (
                            <div className="text-xs text-gray-500 mt-1">
                              💡 Free Tier: {service.freeTier || 'Not available'}
                            </div>
                          )}
                          {awsServices[service.key] && !isFree && service.freeNote && (
                            <div className="text-xs text-orange-700 mt-1 bg-orange-100 rounded px-2 py-1">
                              📊 {service.freeNote.replace('Free for', 'Would be free for')}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-bold ml-2 ${status.color}`}>
                        {awsServices[service.key] ? `₹${(awsCosts[service.key] * 83.5).toFixed(0)}` : '₹0'}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t-2 border-orange-200">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">AWS Total</span>
                <span className="text-xl font-bold text-orange-600">₹{(awsCosts.total * 83.5 / 1000).toFixed(1)}K/mo</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-bold">Azure Costs</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-blue-50 rounded text-sm">
                <span>Containers</span>
                <span className="font-bold">₹{(azureCosts.aci * 83.5).toFixed(0)}</span>
              </div>
              <div className="flex justify-between p-2 bg-blue-50 rounded text-sm">
                <span>OpenAI</span>
                <span className="font-bold">₹{(azureCosts.openAI * 83.5).toFixed(0)}</span>
              </div>
              <div className="flex justify-between p-2 bg-blue-50 rounded text-sm">
                <span>AI Services</span>
                <span className="font-bold">₹{((azureCosts.cognitiveServices + azureCosts.aiSearch) * 83.5).toFixed(0)}</span>
              </div>
              <div className="flex justify-between p-2 bg-blue-100 rounded font-bold text-sm">
                <span>Total</span>
                <span>₹{(azureCosts.total * 83.5 / 1000).toFixed(1)}K/mo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-5 mb-6">
          <h2 className="text-lg font-bold mb-4">👥 Team ({results.team.total} people)</h2>
          <div className="grid md:grid-cols-4 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold">Backend</span>
                <span className="text-2xl font-bold text-blue-600">{results.team.backendDevs}</span>
              </div>
              <p className="text-xs text-gray-600">{scope.backendServices} services</p>
              <p className="text-xs text-blue-700 mt-1">₹{(results.team.backendDevs * costs.backendDev / 100000).toFixed(1)}L</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold">Frontend</span>
                <span className="text-2xl font-bold text-green-600">{results.team.frontendDevs}</span>
              </div>
              <p className="text-xs text-gray-600">{scope.frontendServices} services</p>
              <p className="text-xs text-green-700 mt-1">₹{(results.team.frontendDevs * costs.frontendDev / 100000).toFixed(1)}L</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold">AI/ML</span>
                <span className="text-2xl font-bold text-purple-600">{results.team.aiEngineers}</span>
              </div>
              <p className="text-xs text-gray-600">{scope.aiAgents + scope.generativeAI} AI systems</p>
              <p className="text-xs text-purple-700 mt-1">₹{(results.team.aiEngineers * costs.aiEngineer / 100000).toFixed(1)}L</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold">DevOps</span>
                <span className="text-2xl font-bold text-orange-600">{results.team.devopsEngineers}</span>
              </div>
              <p className="text-xs text-gray-600">AWS + Azure</p>
              <p className="text-xs text-orange-700 mt-1">₹{(results.team.devopsEngineers * costs.devops / 100000).toFixed(1)}L</p>
            </div>
            <div className="bg-pink-50 border border-pink-200 rounded p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold">QA</span>
                <span className="text-2xl font-bold text-pink-600">{results.team.qaEngineers}</span>
              </div>
              <p className="text-xs text-gray-600">Testing</p>
              <p className="text-xs text-pink-700 mt-1">₹{(results.team.qaEngineers * costs.qa / 100000).toFixed(1)}L</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold">Leads</span>
                <span className="text-2xl font-bold text-indigo-600">{results.team.techLeads}</span>
              </div>
              <p className="text-xs text-gray-600">Tech Lead</p>
              <p className="text-xs text-indigo-700 mt-1">₹{(results.team.techLeads * costs.techLead / 100000).toFixed(1)}L</p>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold">PM</span>
                <span className="text-2xl font-bold text-teal-600">{results.team.projectManagers}</span>
              </div>
              <p className="text-xs text-gray-600">Manager</p>
              <p className="text-xs text-teal-700 mt-1">₹{(results.team.projectManagers * costs.pm / 100000).toFixed(1)}L</p>
            </div>
            <div className="bg-purple-600 text-white rounded p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold">TOTAL</span>
                <span className="text-2xl font-bold">{results.team.total}</span>
              </div>
              <p className="text-xs">All roles</p>
              <p className="text-xs mt-1">₹{(monthlySalaryCost / 100000).toFixed(1)}L</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-5 text-white mb-6">
          <h2 className="text-xl font-bold mb-4">💰 Summary</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-purple-200">Salaries</p>
              <p className="text-2xl font-bold">₹{(monthlySalaryCost / 100000).toFixed(1)}L</p>
            </div>
            <div>
              <p className="text-xs text-purple-200">Infrastructure</p>
              <p className="text-2xl font-bold">₹{(monthlyInfraCost * 83.5 / 1000).toFixed(0)}K</p>
            </div>
            <div>
              <p className="text-xs text-purple-200">Project ({timeline}mo)</p>
              <p className="text-2xl font-bold">₹{(totalProjectCost / 10000000).toFixed(2)}Cr</p>
            </div>
            <div>
              <p className="text-xs text-purple-200">Maintenance</p>
              <p className="text-2xl font-bold">₹{(maintenanceCost / 100000).toFixed(1)}L/mo</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-bold text-sm text-green-900 mb-1">Multi-Cloud</h3>
                <p className="text-xs text-green-800">AWS: {totalServices} services • Azure: {scope.aiAgents + scope.generativeAI} AI</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="font-bold text-sm text-yellow-900 mb-1">Note</h3>
                <p className="text-xs text-yellow-800">Select/deselect AWS services to customize your infrastructure</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;