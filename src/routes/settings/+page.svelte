<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { useUser } from '$lib/user.svelte';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '../../convex/_generated/api';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import LogOut from '@lucide/svelte/icons/log-out';
	import User from '@lucide/svelte/icons/user';
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import Zap from '@lucide/svelte/icons/zap';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { CONF } from '../../conf';
	import OpenRouter from './OpenRouter.svelte';

	let {} = $props();

	const user = useUser();
	const client = useConvexClient();

	let isSigningOut = $state(false);
	let isSavingKey = $state(false);
	let isDeletingAccount = $state(false);
	let deleteDialogOpen = $state(false);
	let openRouterKey = $state('');
	let keyUpdateMessage = $state('');

	$effect(() => {
		if (user.isAuthenticated && user.row?.isAnonymous) {
			isSigningOut = false;
		}
		if (user.row?.openRouterKey) {
			openRouterKey = user.row.openRouterKey;
		}
	});

	// Helper functions
	const formatCredits = (centThousandths: number) => {
		return (centThousandths / 1000).toFixed(2);
	};

	const formatDate = (timestamp: number) => {
		return new Date(timestamp).toLocaleDateString();
	};

	const handleSaveOpenRouterKey = async () => {
		isSavingKey = true;
		keyUpdateMessage = '';

		try {
			await client.mutation(api.users.updateOpenRouterKey, { key: openRouterKey.trim() });
			keyUpdateMessage = 'OpenRouter key updated successfully!';
		} catch (error) {
			keyUpdateMessage = 'Failed to update OpenRouter key. Please try again.';
		} finally {
			isSavingKey = false;
		}
	};

	const handleDeleteAccount = async () => {
		isDeletingAccount = true;

		try {
			await client.mutation(api.users.deleteAccount, {});
			// Redirect to home page after successful deletion
			window.location.href = '/';
		} catch (error) {
			console.error('Failed to delete account:', error);
			alert('Failed to delete account. Please try again.');
		} finally {
			isDeletingAccount = false;
			deleteDialogOpen = false;
		}
	};

	const avatarSrc = $derived(user.row?.image ? `/img/${encodeURIComponent(user.row.image)}` : null);
</script>

{#if user.isAnonymous}
	<div class="w-full h-full grid place-content-center p-8">
		<p class="text-muted-foreground text-center">Please sign in to access your account settings.</p>
	</div>
{:else if user.row}
	<div class="w-full max-w-6xl mx-auto p-6 space-y-6 pt-12">
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-bold">Account Settings</h1>
			<Button
				disabled={isSigningOut}
				onclick={() => {
					isSigningOut = true;
					user.signOut();
				}}
				variant="secondary"
			>
				{#if isSigningOut}
					<Loader2Icon class="animate-spin mr-2 h-4 w-4" />
				{:else}
					<LogOut class="mr-2 h-4 w-4" />
				{/if}
				Sign out
			</Button>
		</div>

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- User Info Section -->
			<Card.Root>
				<Card.Header>
					<div class="flex items-center space-x-2">
						<User class="h-5 w-5" />
						<h2 class="text-xl font-semibold">User Information</h2>
					</div>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="flex items-center space-x-4">
						<Avatar.Root class="h-16 w-16">
							{#if avatarSrc}
								<Avatar.Image src={avatarSrc} alt="User Avatar" />
							{/if}
							<Avatar.Fallback class="text-lg">{user.row?.name?.[0] ?? ''}</Avatar.Fallback>
						</Avatar.Root>
						<div>
							<h3 class="text-lg font-medium">{user.row.name || 'Unknown User'}</h3>
							<p class="text-muted-foreground">{user.row.email || 'No email'}</p>
							<p class="text-sm text-muted-foreground">
								Member since {formatDate(user.row._creationTime)}
							</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4 pt-4 border-t">
						<div>
							<p class="text-sm font-medium">Account Type</p>
							<p class="text-muted-foreground">
								{user.row.openRouterKey ? 'Pro' : 'Basic'}
							</p>
						</div>
						<div>
							<p class="text-sm font-medium">Email Verified</p>
							<div class="flex items-center space-x-1">
								{#if user.row.emailVerificationTime}
									<CheckCircle class="h-4 w-4 text-green-500" />
									<span class="text-green-600 text-sm">Verified</span>
								{:else}
									<AlertCircle class="h-4 w-4 text-yellow-500" />
									<span class="text-yellow-600 text-sm">Unverified</span>
								{/if}
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Usage & Credits Section -->
			<Card.Root>
				<Card.Header>
					<div class="flex items-center space-x-2">
						<Zap class="h-5 w-5" />
						<h2 class="text-xl font-semibold">Usage & Credits</h2>
					</div>
				</Card.Header>
				<Card.Content class="">
					<div class="grid grid-cols-2 gap-4">
						<div
							class="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
						>
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm font-medium text-blue-700 dark:text-blue-300"
									>Free Requests</span
								>
								<Zap class="h-4 w-4 text-blue-500" />
							</div>
							<p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
								{user.row.freeRequestsLeft || 0}
							</p>
							<p class="text-xs text-blue-600/70 dark:text-blue-400/70">remaining this month</p>
						</div>

						<div
							class="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800"
						>
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm font-medium text-green-700 dark:text-green-300"
									>Account Credits</span
								>
								<CreditCard class="h-4 w-4 text-green-500" />
							</div>
							<p class="text-2xl font-bold text-green-600 dark:text-green-400">
								¢{formatCredits(user.row.accountCreditsInCentThousandths || 0)}
							</p>
							<p class="text-xs text-green-600/70 dark:text-green-400/70">available balance</p>
						</div>
					</div>

					<div class="pt-6">
						<div class="flex justify-between text-sm">
							<span class="text-muted-foreground">Billing Cycle</span>
							<span>{user.row.freeRequestsBillingCycle || 'N/A'}</span>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- OpenRouter API Key Section -->
			<Card.Root class="lg:col-span-2">
				<Card.Header>
					<div class="flex items-center space-x-2">
						<OpenRouter />
						<h2 class="text-xl font-semibold">OpenRouter API Key</h2>
					</div>
					<p class="text-muted-foreground">
						Connect your OpenRouter account to access hundreds of models with pay-per-use pricing.
					</p>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="flex items-center space-x-2 mb-4">
						{#if user.row.openRouterKey}
							<CheckCircle class="h-5 w-5 text-green-500" />
							<span class="text-green-600 font-medium">OpenRouter Connected</span>
						{:else}
							<AlertCircle class="h-5 w-5 text-yellow-500" />
							<span class="text-yellow-600 font-medium"
								>OpenRouter Not Connected. Connect to Unlock Pro</span
							>
						{/if}
					</div>

					<div class="space-y-2">
						<label for="openrouter-key" class="text-sm font-medium">API Key</label>
						<div class="flex space-x-2">
							<Input
								id="openrouter-key"
								type="password"
								placeholder="sk-or-v1-..."
								bind:value={openRouterKey}
								class="flex-1"
							/>
							<Button onclick={handleSaveOpenRouterKey} disabled={isSavingKey}>
								{#if isSavingKey}
									<Loader2Icon class="animate-spin mr-2 h-4 w-4" />
								{/if}
								Save
							</Button>
						</div>
						{#if keyUpdateMessage}
							<p
								class="text-sm {keyUpdateMessage.includes('success')
									? 'text-green-600'
									: 'text-red-600'}"
							>
								{keyUpdateMessage}
							</p>
						{/if}
					</div>

					<div class="bg-muted p-4 rounded-lg">
						<h4 class="font-medium mb-2">Benefits of connecting OpenRouter:</h4>
						<ul class="text-sm text-muted-foreground space-y-1">
							<li>• Unlock attachments and search</li>
							<li>• Pay-per-use pricing directly through OpenRouter</li>
							<li>• Access hundreds of AI models</li>
							<li>• All requests go through your key (including naming threads)</li>
						</ul>
						<p class="text-sm text-muted-foreground mt-3">
							Get your API key from <a
								href="https://openrouter.ai/keys"
								target="_blank"
								class="text-primary hover:underline">OpenRouter</a
							>
						</p>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Pricing Section -->
			<Card.Root class="lg:col-span-2">
				<Card.Header>
					<div class="flex items-center space-x-2">
						<CreditCard class="h-5 w-5" />
						<h2 class="text-xl font-semibold">Pricing Information</h2>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div class="border rounded-lg p-6">
							<h3 class="text-lg font-semibold mb-1 text-center">Basic Plan</h3>
							<div class="text-center mb-4">
								<span class="text-3xl font-bold">Free</span>
								<p class="text-sm text-muted-foreground">Through Caleb</p>
							</div>
							<ul class="space-y-2 text-sm">
								<li class="flex items-center">
									<CheckCircle class="h-4 w-4 text-green-500 mr-2" />
									{CONF.freeMessagesRegistered} free messages per month
								</li>
								<li class="flex items-center">
									<CheckCircle class="h-4 w-4 text-green-500 mr-2" />
									Access to free models only
								</li>
								<li class="flex items-center">
									<CheckCircle class="h-4 w-4 text-green-500 mr-2" />
									Monthly credit allocation of ¢{formatCredits(
										CONF.monthlyCreditsInCentThousandthsRegistered
									)}
								</li>
							</ul>
						</div>

						<div class="border rounded-lg p-6 bg-primary/5 border-primary/20">
							<h3 class="text-lg font-semibold mb-1 text-center">Pro Plan</h3>
							<div class="text-center mb-4">
								<span class="text-3xl font-bold">Pay-per-use</span>
								<p class="text-sm text-muted-foreground">Through OpenRouter</p>
							</div>
							<ul class="space-y-2 text-sm">
								<li class="flex items-center">
									<CheckCircle class="h-4 w-4 text-green-500 mr-2" />
									Access to hundreds of models
								</li>
								<li class="flex items-center">
									<CheckCircle class="h-4 w-4 text-green-500 mr-2" />
									Unlock search and attachments
								</li>
								<li class="flex items-center">
									<CheckCircle class="h-4 w-4 text-green-500 mr-2" />
									Monthly credit allocation of ¢{formatCredits(
										CONF.monthlyCreditsInCentThousandthsRegistered
									)}
								</li>
							</ul>
						</div>
					</div>

					<div class="mt-4 bg-muted p-4 rounded-lg">
						<h4 class="font-medium mb-2">Pricing Details:</h4>
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							<div>
								<span class="text-muted-foreground">Cost per Message</span>
								<span class="ml-2 font-medium"
									>¢{formatCredits(CONF.costPerMessageInCentThousandths)}</span
								>
							</div>
							<div>
								<span class="text-muted-foreground">Cost per MB Uploaded</span>
								<span class="ml-2 font-medium"
									>¢{formatCredits(CONF.costPerMbUploadInCentThousandths)}</span
								>
							</div>
						</div>
					</div>

					<div class="mt-4 bg-muted p-4 rounded-lg">
						<h4 class="font-medium mb-2">Free Models Available:</h4>
						<div class="flex flex-wrap gap-2 text-sm">
							{#each CONF.freeModelIds as modelId}
								<span class="bg-background px-2 py-1 rounded border">
									{modelId.split('/').pop()}
								</span>
							{/each}
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Danger Zone -->
			<Card.Root class="lg:col-span-2 border-red-200 dark:border-red-800">
				<Card.Header>
					<div class="flex items-center space-x-2">
						<Trash2 class="h-5 w-5 text-red-500" />
						<h2 class="text-xl font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
					</div>
					<p class="text-muted-foreground">
						Irreversible actions that will permanently affect your account.
					</p>
				</Card.Header>
				<Card.Content>
					<div
						class="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800"
					>
						<h3 class="font-medium text-red-800 dark:text-red-200 mb-2">Delete Account</h3>
						<p class="text-sm text-red-700 dark:text-red-300 mb-4">
							This action cannot be undone. This will permanently delete your account, all your
							conversations, and remove all associated data from our servers.
						</p>
						<Button
							variant="destructive"
							class="bg-red-600 hover:bg-red-700"
							onclick={() => (deleteDialogOpen = true)}
						>
							<Trash2 class="mr-2 h-4 w-4" />
							Delete Account
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
{/if}

<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete your account and remove all your
				data from our servers, including:
				<ul class="list-disc ml-6 mt-2">
					<li>All your conversations and messages</li>
					<li>Your account settings and preferences</li>
					<li>Any uploaded files or attachments</li>
				</ul>
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleDeleteAccount} disabled={isDeletingAccount}>
				{#if isDeletingAccount}
					<Loader2Icon class="animate-spin mr-2 h-4 w-4" />
				{:else}
					<Trash2 class="mr-2 h-4 w-4" />
				{/if}
				Delete Forever
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
