'use client'

import React from 'react'
import {
    JimboPanel as SharedJimboPanel,
    JimboInnerPanel as SharedJimboInnerPanel,
    JimboButton as SharedJimboButton,
    JimboBackButton as SharedJimboBackButton
} from '@jimbo-ui/components/Panel'

/**
 * JimboPanel — Legacy wrapper for the Unified Jimbo UI library.
 * This file is being phased out in favor of direct imports from @jimbo-ui.
 */
export const JimboPanel = SharedJimboPanel
export const JimboInnerPanel = SharedJimboInnerPanel
export const JimboButton = SharedJimboButton
export const JimboBackButton = SharedJimboBackButton

// Exporting default for compatibility with some imports if any
export default JimboPanel
