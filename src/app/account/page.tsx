'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface SubscriptionData {
  plan: {
    name: string
    price: number
    features: string[]
  }
  status: string
  startDate: string
  nextBillingDate?: string
  subscriptionId?: string
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSubscriptionData()
    }
  }, [status])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/account/subscription')
      if (!response.ok) {
        throw new Error('Failed to fetch subscription data')
      }
      const data = await response.json()
      setSubscription(data)
    } catch (err) {
      setError('Failed to load subscription information')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return
    }

    try {
      setCancelling(true)
      const response = await fetch('/api/subscriptions/cancel-stripe', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      const result = await response.json()
      if (result.success) {
        await fetchSubscriptionData()
        alert('Your subscription has been cancelled. You will retain access until the end of your billing period.')
      }
    } catch (err) {
      alert('Failed to cancel subscription. Please try again or contact support.')
      console.error(err)
    } finally {
      setCancelling(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-64"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="space-y-6">
        {/* User Information */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-2">Account Information</h2>
          <p className="text-sm text-gray-400 mb-4">Your account details and preferences</p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400">Email</label>
              <p className="text-lg">{session?.user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">Name</label>
              <p className="text-lg">{session?.user?.name || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* Subscription Information */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-2">Subscription & Billing</h2>
          <p className="text-sm text-gray-400 mb-4">Manage your subscription and billing details</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-400">Current Plan</label>
                <p className="text-lg font-semibold">{subscription?.plan.name || 'Free'}</p>
              </div>
              <div className="text-right">
                <label className="text-sm font-medium text-gray-400">Price</label>
                <p className="text-lg font-semibold">
                  {subscription?.plan.price ? `$${subscription.plan.price}/month` : 'Free'}
                </p>
              </div>
            </div>

            {subscription?.status && (
              <div>
                <label className="text-sm font-medium text-gray-400">Status</label>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    subscription.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  <p className="capitalize">{subscription.status.toLowerCase()}</p>
                </div>
              </div>
            )}

            {subscription?.startDate && (
              <div className="flex items-center gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-400">Start Date</label>
                  <p>{new Date(subscription.startDate).toLocaleDateString()}</p>
                </div>
                {subscription?.nextBillingDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-400">Next Billing</label>
                    <p>{new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            )}

            {/* Plan Features */}
            {subscription?.plan.features && subscription.plan.features.length > 0 && (
              <div className="pt-4 border-t border-gray-700">
                <label className="text-sm font-medium text-gray-400 mb-2 block">Plan Features</label>
                <ul className="space-y-1">
                  {subscription.plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            {subscription?.status === 'ACTIVE' ? (
              <>
                <Link href="/subscribe" className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-normal text-sm inline-block">
                  Change Plan
                </Link>
                <button 
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="bg-red-900/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-900/30 transition-colors font-normal text-sm"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </>
            ) : (
              <Link href="/subscribe" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-normal text-sm inline-block">
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-2">Usage Statistics</h2>
          <p className="text-sm text-gray-400 mb-4">Your current usage and limits</p>
          <div className="text-sm text-gray-400">
            Usage statistics will be displayed here
          </div>
        </div>
      </div>
    </div>
  )
}