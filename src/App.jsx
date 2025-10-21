import React, { useState } from 'react';
import { DollarSign, Server, Database, Users, Mail, Bell, Package } from 'lucide-react';

const AWSCostCalculator = () => {
  const [userCount, setUserCount] = useState(10);
  const [currency, setCurrency] = useState('INR'); // USD or INR
  const [deploymentType, setDeploymentType] = useState('monorepo'); // monorepo or microservices
  const USD_TO_INR = 83.5; // Current exchange rate

  const formatCurrency = (amount) => {
    if (currency === 'INR') {
      return `₹${(amount * USD_TO_INR).toFixed(2)}`;
    }
    return `$${amount.toFixed(2)}`;
  };

  // Cost calculations based on user count and deployment type
  const calculateCosts = (users) => {
    let ec2InstancesNeeded, ec2InstanceType, ec2HourlyCost;

    if (deploymentType === 'monorepo') {
      // Monorepo: All services run together, fewer instances needed
      // 1-2 larger instances can handle all 20 services bundled together
      if (users <= 50) {
        ec2InstancesNeeded = 1;
        ec2InstanceType = 't3.large';
        ec2HourlyCost = 0.0832; // t3.large
      } else if (users <= 100) {
        ec2InstancesNeeded = 2;
        ec2InstanceType = 't3.large';
        ec2HourlyCost = 0.0832;
      } else if (users <= 200) {
        ec2InstancesNeeded = 2;
        ec2InstanceType = 't3.xlarge';
        ec2HourlyCost = 0.1664;
      } else {
        ec2InstancesNeeded = 3;
        ec2InstanceType = 't3.xlarge';
        ec2HourlyCost = 0.1664;
      }
    } else {
      // Microservices: Each service runs separately, more instances needed
      if (users <= 40) {
        ec2InstancesNeeded = 6;
        ec2InstanceType = 't3.medium';
        ec2HourlyCost = 0.0416;
      } else if (users <= 100) {
        ec2InstancesNeeded = 8;
        ec2InstanceType = 't3.medium';
        ec2HourlyCost = 0.0416;
      } else if (users <= 200) {
        ec2InstancesNeeded = 12;
        ec2InstanceType = 't3.medium';
        ec2HourlyCost = 0.0416;
      } else {
        ec2InstancesNeeded = 16;
        ec2InstanceType = 't3.medium';
        ec2HourlyCost = 0.0416;
      }
    }

    const ec2MonthlyCost = ec2InstancesNeeded * ec2HourlyCost * 730;

    // S3 Costs
    const s3Storage = users <= 40 ? 20 : users <= 100 ? 50 : users <= 200 ? 100 : users <= 300 ? 200 : 300;
    const s3StorageCost = s3Storage * 0.023;
    const s3RequestsCost = (users * 1000 * 0.0004) / 1000;
    const s3TotalCost = s3StorageCost + s3RequestsCost;

    // Cognito Costs (Lite tier - first 50k MAU free)
    let cognitoCost = 0;
    if (users > 50000) {
      const billableUsers = users - 50000;
      if (billableUsers <= 50000) {
        cognitoCost = billableUsers * 0.0055;
      } else {
        cognitoCost = 50000 * 0.0055 + (billableUsers - 50000) * 0.0046;
      }
    }

    // SNS Costs (first 1M requests free)
    const snsNotifications = users * 100;
    const snsCost = snsNotifications > 1000000 ? ((snsNotifications - 1000000) / 1000000) * 0.50 : 0;

    // SQS Costs (first 1M requests free)
    const sqsRequests = users * 500;
    const sqsCost = sqsRequests > 1000000 ? ((sqsRequests - 1000000) / 1000000) * 0.40 : 0;

    // Redis/ElastiCache
    const redisInstanceType = users <= 100 ? 'cache.t3.micro' : 'cache.t3.small';
    const redisHourlyCost = users <= 100 ? 0.017 : 0.034;
    const redisInstances = users <= 200 ? 1 : 2;
    const redisMonthlyCost = redisInstances * redisHourlyCost * 730;

    // Data Transfer
    const dataTransferGB = 10 + (users / 10);
    const dataTransferCost = Math.max(0, (dataTransferGB - 100) * 0.09);

    const totalCost = ec2MonthlyCost + s3TotalCost + cognitoCost + snsCost + sqsCost + redisMonthlyCost + dataTransferCost;

    return {
      ec2: ec2MonthlyCost,
      ec2Instances: ec2InstancesNeeded,
      ec2Type: ec2InstanceType,
      s3: s3TotalCost,
      s3Storage: s3Storage,
      cognito: cognitoCost,
      sns: snsCost,
      sqs: sqsCost,
      redis: redisMonthlyCost,
      redisType: redisInstanceType,
      redisInstances: redisInstances,
      dataTransfer: dataTransferCost,
      total: totalCost
    };
  };

  const userScenarios = [10, 20, 30, 40, 50, 100, 150, 200, 300];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <DollarSign className="w-12 h-12 text-indigo-600" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">AWS Cost Estimator</h1>
                <p className="text-gray-600 mt-1">20 Node.js Services (10 Backend + 10 Frontend)</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  currency === 'USD'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('INR')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  currency === 'INR'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                INR (₹)
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 mb-8 border-2 border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-8 h-8 text-purple-600" />
              <h2 className="text-xl font-semibold text-purple-900">Deployment Architecture:</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setDeploymentType('monorepo')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  deploymentType === 'monorepo'
                    ? 'border-purple-600 bg-purple-100 shadow-lg'
                    : 'border-gray-300 bg-white hover:border-purple-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-6 h-6 text-purple-600" />
                  <h3 className="font-bold text-lg text-gray-900">Monorepo Architecture</h3>
                  {deploymentType === 'monorepo' && (
                    <span className="ml-auto bg-purple-600 text-white text-xs px-2 py-1 rounded-full">Selected</span>
                  )}
                </div>
                <p className="text-sm text-gray-700">All services bundled together. Fewer, larger EC2 instances. <strong>More cost-efficient</strong> for smaller teams.</p>
                <p className="text-xs text-purple-700 mt-2">💰 Typically 30-50% cheaper than microservices</p>
              </button>

              <button
                onClick={() => setDeploymentType('microservices')}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  deploymentType === 'microservices'
                    ? 'border-indigo-600 bg-indigo-100 shadow-lg'
                    : 'border-gray-300 bg-white hover:border-indigo-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-6 h-6 text-indigo-600" />
                  <h3 className="font-bold text-lg text-gray-900">Microservices Architecture</h3>
                  {deploymentType === 'microservices' && (
                    <span className="ml-auto bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">Selected</span>
                  )}
                </div>
                <p className="text-sm text-gray-700">Services run independently. More EC2 instances needed. Better scalability and isolation.</p>
                <p className="text-xs text-indigo-700 mt-2">🚀 Better for large-scale production environments</p>
              </button>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-indigo-900 mb-4">Your Configuration:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                <Server className="w-6 h-6 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">Backend Services</p>
                  <p className="font-semibold text-gray-900">10 Services</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                <Server className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Frontend Services</p>
                  <p className="font-semibold text-gray-900">10 Services</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                <Database className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">AWS Services</p>
                  <p className="font-semibold text-gray-900">EC2, S3, Cognito, SNS, SQS, Redis</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select User Count: <span className="text-2xl font-bold text-indigo-600">{userCount}</span>
            </label>
            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={userCount}
              onChange={(e) => setUserCount(parseInt(e.target.value))}
              className="w-full h-3 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>10</span>
              <span>50</span>
              <span>100</span>
              <span>150</span>
              <span>200</span>
              <span>250</span>
              <span>300</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-6 mb-8">
            <h3 className="text-2xl font-bold mb-2">Current Estimate ({deploymentType === 'monorepo' ? 'Monorepo' : 'Microservices'})</h3>
            <p className="text-5xl font-bold">{formatCurrency(calculateCosts(userCount).total)}</p>
            <p className="text-indigo-200 mt-2">per month ({userCount} users)</p>
            {currency === 'INR' && (
              <p className="text-sm text-indigo-100 mt-2">≈ ${calculateCosts(userCount).total.toFixed(2)} USD</p>
            )}
            <div className="mt-4 bg-white/20 rounded-lg p-3">
              <p className="text-sm">
                <strong>{calculateCosts(userCount).ec2Instances} × {calculateCosts(userCount).ec2Type}</strong> EC2 instances
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <h2 className="text-3xl font-bold text-white">Detailed Cost Breakdown by User Count</h2>
            <p className="text-indigo-100 mt-1">Architecture: {deploymentType === 'monorepo' ? 'Monorepo (Bundled Services)' : 'Microservices (Separate Services)'}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Service
                  </th>
                  {userScenarios.map(users => (
                    <th key={users} className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {users} Users
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-indigo-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Server className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-semibold text-gray-900">EC2 Instances</p>
                        <p className="text-sm text-gray-500">{deploymentType === 'monorepo' ? 'Bundled' : 'Distributed'}</p>
                      </div>
                    </div>
                  </td>
                  {userScenarios.map(users => {
                    const costs = calculateCosts(users);
                    return (
                      <td key={users} className="px-6 py-4 text-center">
                        <p className="font-bold text-gray-900">{formatCurrency(costs.ec2)}</p>
                        <p className="text-xs text-gray-500">{costs.ec2Instances}× {costs.ec2Type}</p>
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-indigo-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-semibold text-gray-900">S3 Storage</p>
                        <p className="text-sm text-gray-500">Storage + Requests</p>
                      </div>
                    </div>
                  </td>
                  {userScenarios.map(users => {
                    const costs = calculateCosts(users);
                    return (
                      <td key={users} className="px-6 py-4 text-center">
                        <p className="font-bold text-gray-900">{formatCurrency(costs.s3)}</p>
                        <p className="text-xs text-gray-500">{costs.s3Storage} GB</p>
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-indigo-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-semibold text-gray-900">Cognito</p>
                        <p className="text-sm text-gray-500">Authentication</p>
                      </div>
                    </div>
                  </td>
                  {userScenarios.map(users => {
                    const costs = calculateCosts(users);
                    return (
                      <td key={users} className="px-6 py-4 text-center">
                        <p className="font-bold text-gray-900">{formatCurrency(costs.cognito)}</p>
                        <p className="text-xs text-green-600">Free tier</p>
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-indigo-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-semibold text-gray-900">SNS</p>
                        <p className="text-sm text-gray-500">Notifications</p>
                      </div>
                    </div>
                  </td>
                  {userScenarios.map(users => {
                    const costs = calculateCosts(users);
                    return (
                      <td key={users} className="px-6 py-4 text-center">
                        <p className="font-bold text-gray-900">{formatCurrency(costs.sns)}</p>
                        <p className="text-xs text-gray-500">{(users * 100 / 1000).toFixed(0)}k msgs</p>
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-indigo-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-semibold text-gray-900">SQS</p>
                        <p className="text-sm text-gray-500">Message Queue</p>
                      </div>
                    </div>
                  </td>
                  {userScenarios.map(users => {
                    const costs = calculateCosts(users);
                    return (
                      <td key={users} className="px-6 py-4 text-center">
                        <p className="font-bold text-gray-900">{formatCurrency(costs.sqs)}</p>
                        <p className="text-xs text-gray-500">{(users * 500 / 1000).toFixed(0)}k msgs</p>
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-indigo-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-semibold text-gray-900">Redis (ElastiCache)</p>
                        <p className="text-sm text-gray-500">Caching</p>
                      </div>
                    </div>
                  </td>
                  {userScenarios.map(users => {
                    const costs = calculateCosts(users);
                    return (
                      <td key={users} className="px-6 py-4 text-center">
                        <p className="font-bold text-gray-900">{formatCurrency(costs.redis)}</p>
                        <p className="text-xs text-gray-500">{costs.redisType}</p>
                      </td>
                    );
                  })}
                </tr>

                <tr className="hover:bg-indigo-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Server className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="font-semibold text-gray-900">Data Transfer</p>
                        <p className="text-sm text-gray-500">Outbound</p>
                      </div>
                    </div>
                  </td>
                  {userScenarios.map(users => {
                    const costs = calculateCosts(users);
                    return (
                      <td key={users} className="px-6 py-4 text-center">
                        <p className="font-bold text-gray-900">{formatCurrency(costs.dataTransfer)}</p>
                        <p className="text-xs text-gray-500">~{(10 + users/10).toFixed(0)} GB</p>
                      </td>
                    );
                  })}
                </tr>

                <tr className="bg-gradient-to-r from-indigo-100 to-purple-100 font-bold">
                  <td className="px-6 py-5 text-lg text-gray-900">
                    TOTAL MONTHLY COST
                  </td>
                  {userScenarios.map(users => {
                    const costs = calculateCosts(users);
                    return (
                      <td key={users} className="px-6 py-5 text-center">
                        <p className="text-2xl font-bold text-indigo-700">{formatCurrency(costs.total)}</p>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">💡 Important Notes:</h3>
          <ul className="space-y-2 text-yellow-800">
            <li>• <strong>Architecture:</strong> Monorepo uses fewer, larger instances (30-50% cheaper). Microservices uses more, smaller instances (better isolation).</li>
            <li>• <strong>Currency:</strong> Exchange rate: 1 USD = ₹{USD_TO_INR} (Toggle button to switch)</li>
            <li>• <strong>Region:</strong> Prices based on US-East-1 (N. Virginia). Other regions may vary.</li>
            <li>• <strong>Free Tiers:</strong> Cognito first 50k MAU, SNS/SQS first 1M requests are FREE.</li>
            <li>• <strong>Optimization:</strong> Use Reserved Instances for 40-70% savings on EC2 costs.</li>
            <li>• <strong>Actual Usage:</strong> Costs vary based on actual traffic patterns and data usage.</li>
            <li>• <strong>Additional Costs:</strong> Load balancers, CloudWatch, backups may add extra charges.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AWSCostCalculator;