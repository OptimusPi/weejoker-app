'use client'

import React from 'react'
import { cn } from '@/lib/utils'

// ============================================
// JimboPanel — the structural container
//
// RULES:
// - Uses .jimbo-panel CSS class (globals.css)
// - If onBack is provided, a full-width gold "Back" button
//   is ALWAYS rendered at the bottom. Structural guarantee.
// ============================================

export interface JimboPanelProps {
    children: React.ReactNode
    onBack?: () => void
    backLabel?: string
    hideBack?: boolean
    className?: string
}

export function JimboPanel({
    children,
    onBack,
    backLabel = 'Back',
    hideBack = false,
    className,
}: JimboPanelProps) {
    return (
        <div className={cn('jimbo-panel', className)}>
            <div className="flex-1">
                {children}
            </div>
            {onBack && !hideBack && (
                <div className="mt-3">
                    <JimboBackButton onClick={onBack} label={backLabel} />
                </div>
            )}
        </div>
    )
}

// ============================================
// JimboInnerPanel — nested content
// Nesting rule: DARK_GREY → INNER_BORDER → DARK_GREY → repeat
// ============================================

export function JimboInnerPanel({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <div className={cn('jimbo-inner-panel', className)}>
            {children}
        </div>
    )
}

// ============================================
// JimboButton — uses .jimbo-btn + variant class
// ============================================

type ButtonVariant = 'red' | 'blue' | 'green' | 'orange' | 'purple' | 'back'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
    red: 'jimbo-btn-red',
    blue: 'jimbo-btn-blue',
    green: 'jimbo-btn-green',
    orange: 'jimbo-btn-orange',
    purple: 'jimbo-btn-purple',
    back: 'jimbo-btn-back',
}

export function JimboButton({
    children,
    variant = 'red',
    onClick,
    disabled = false,
    className,
}: {
    children: React.ReactNode
    variant?: ButtonVariant
    onClick?: () => void
    disabled?: boolean
    className?: string
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn('jimbo-btn', VARIANT_CLASS[variant], className)}
        >
            {children}
        </button>
    )
}

// ============================================
// JimboBackButton — orange, full-width, structural
// No X icons. No close buttons. Just "Back".
// ============================================

export function JimboBackButton({
    onClick,
    label = 'Back',
    className,
}: {
    onClick?: () => void
    label?: string
    className?: string
}) {
    return (
        <JimboButton variant="back" onClick={onClick} className={className}>
            {label}
        </JimboButton>
    )
}

// ============================================
// JimboInput / JimboTextArea — uses .jimbo-input
// ============================================

export function JimboInput({
    className,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input className={cn('jimbo-input', className)} {...props} />
    )
}

export function JimboTextArea({
    className,
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea className={cn('jimbo-input', className)} {...props} />
    )
}
