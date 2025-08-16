import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Wallet, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWallet } from '../../contexts/WalletContext';
import { supabase } from '../../lib/supabase';
import { createPaymentTransaction, PLATFORM_FEE } from '../../lib/solana';
import { PublicKey } from '@solana/web3.js';
import { extractSkillsFromText } from '../../lib/ai';

const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  company: z.string().min(2, 'Company name is required'),
  job_type: z.enum(['full-time', 'part-time', 'contract', 'freelance']),
  location: z.string().optional(),
  budget_min: z.number().min(0).optional(),
  budget_max: z.number().min(0).optional(),
  salary: z.number().min(0).optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

type JobFormData = z.infer<typeof jobSchema>;

export const PostJobForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'payment' | 'success'>('form');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { wallet, connectWallet, refreshBalance } = useWallet();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
    setValue,
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      skills: [],
    },
  });

  const descriptionValue = watch('description');

  React.useEffect(() => {
    if (descriptionValue) {
      const skills = extractSkillsFromText(descriptionValue);
      setExtractedSkills(skills);
    } else {
      setExtractedSkills([]);
    }
  }, [descriptionValue]);

  React.useEffect(() => {
    setValue('skills', selectedSkills);
  }, [selectedSkills, setValue]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const addCustomSkill = (skill: string) => {
    if (skill.trim() && !selectedSkills.includes(skill.trim())) {
      setSelectedSkills(prev => [...prev, skill.trim()]);
    }
  };

  const onSubmit = async (data: JobFormData) => {
    if (!wallet.connected) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setPaymentStep('payment');

    try {
      // Create payment transaction
      const publicKey = new PublicKey(wallet.publicKey!);
      const transaction = await createPaymentTransaction(publicKey);

      // Sign and send transaction
      const { solana } = window as any;
      const signedTransaction = await solana.signTransaction(transaction);
      const signature = await solana.connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await solana.connection.confirmTransaction(signature);
      setTransactionHash(signature);

      // Create job posting
      const { error: jobError } = await supabase
        .from('jobs')
        .insert({
          ...data,
          posted_by: user!.id,
          payment_confirmed: true,
          transaction_hash: signature,
        });

      if (jobError) throw jobError;

      // Refresh wallet balance
      await refreshBalance();

      setPaymentStep('success');
      
      // Redirect after success
      setTimeout(() => {
        navigate('/jobs');
      }, 3000);

    } catch (error: any) {
      console.error('Error posting job:', error);
      setError('root', {
        message: error.message || 'Failed to post job',
      });
      setPaymentStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  if (paymentStep === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h2>
          <p className="text-gray-600 mb-4">
            Your job has been posted and is now live on the platform.
          </p>
          <div className="bg-gray-50 rounded-md p-3 mb-4">
            <p className="text-sm text-gray-600">Transaction Hash:</p>
            <p className="text-xs font-mono text-gray-800 break-all">{transactionHash}</p>
          </div>
          <p className="text-sm text-gray-500">Redirecting to jobs page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Job</h1>
        <p className="text-gray-600">Find the perfect candidate for your role</p>
      </div>

      {/* Wallet Connection Warning */}
      {!wallet.connected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Wallet Required</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You need to connect your Phantom wallet to pay the platform fee (0.0001 SOL) before posting a job.
              </p>
              <button
                onClick={connectWallet}
                className="mt-2 inline-flex items-center space-x-1 text-sm font-medium text-yellow-800 hover:text-yellow-900"
              >
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Senior React Developer"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                {...register('company')}
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Company name"
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <select
                {...register('job_type')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (Optional)
              </label>
              <input
                {...register('location')}
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Remote, New York, Bangalore"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Min (₹)
              </label>
              <input
                {...register('budget_min', { valueAsNumber: true })}
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Max (₹)
              </label>
              <input
                {...register('budget_max', { valueAsNumber: true })}
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="100000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <textarea
                {...register('description')}
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the role, responsibilities, requirements, and what you're looking for in a candidate..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Required Skills</h2>
            <Sparkles className="h-5 w-5 text-purple-500" />
          </div>

          {extractedSkills.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">AI-suggested skills from your description:</p>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map((skill, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                    {selectedSkills.includes(skill) && (
                      <Check className="inline h-3 w-3 ml-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add custom skill
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a skill and press Enter"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomSkill(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>

          {selectedSkills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Selected skills:</p>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {errors.skills && (
            <p className="mt-2 text-sm text-red-600">{errors.skills.message}</p>
          )}
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Fee</h2>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Platform Fee: {PLATFORM_FEE / 1e9} SOL
                </p>
                <p className="text-xs text-blue-600">
                  This fee helps maintain the platform and ensures quality job postings.
                </p>
              </div>
            </div>
          </div>

          {wallet.connected ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Wallet Connected
                </span>
              </div>
              <span className="text-sm text-green-700">
                Balance: {wallet.balance.toFixed(4)} SOL
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={connectWallet}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-purple-300 rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <Wallet className="h-5 w-5" />
              <span>Connect Phantom Wallet</span>
            </button>
          )}
        </div>

        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !wallet.connected || paymentStep !== 'form'}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {paymentStep === 'payment' ? 'Processing Payment...' : 'Post Job & Pay Fee'}
          </button>
        </div>
      </form>
    </div>
  );
};