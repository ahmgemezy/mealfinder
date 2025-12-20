"use client";

import { useEffect } from "react";

/**
 * This component patches `Node.prototype.removeChild` and `insertBefore` 
 * to be resilient against DOM manipulations performed by Google Translate.
 * Google Translate modifies text nodes (wrapping them in <font>), which causes
 * React to fail when it tries to remove or update those nodes, leading to 
 * "NotFoundError: The node to be removed is not a child of this node".
 */
export default function GoogleTranslateFix() {
    useEffect(() => {
        if (typeof Node === 'undefined') return;

        const originalRemoveChild = Node.prototype.removeChild;
        const originalInsertBefore = Node.prototype.insertBefore;

        // Patch removeChild
        Node.prototype.removeChild = function <T extends Node>(child: T): T {
            try {
                return originalRemoveChild.call(this, child) as T;
            } catch (error) {
                // We only suppress NotFoundError, which usually means the node was already removed 
                // or moved by Google Translate.
                console.warn("[GoogleTranslateFix] Suppressed removeChild error:", error);
                return child;
            }
        };

        // Patch insertBefore
        Node.prototype.insertBefore = function <T extends Node>(
            newNode: T,
            referenceNode: Node | null
        ): T {
            try {
                return originalInsertBefore.call(this, newNode, referenceNode) as T;
            } catch (error) {
                console.warn("[GoogleTranslateFix] Suppressed insertBefore error:", error);
                return newNode;
            }
        };

    }, []);

    return null;
}
