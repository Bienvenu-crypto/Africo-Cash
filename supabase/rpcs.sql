-- Transactions RPC for Africo Cash

-- 1. Transfer Funds (envoyer)
CREATE OR REPLACE FUNCTION transfer_funds(
    sender_account TEXT,
    recipient_account TEXT,
    tx_currency TEXT,
    tx_amount NUMERIC,
    tx_fee NUMERIC
) RETURNS BOOLEAN AS $$
DECLARE
    bal_col TEXT;
    sender_bal NUMERIC;
    total_deduction NUMERIC;
BEGIN
    bal_col := CASE WHEN tx_currency = 'USD' THEN 'balance_usd' ELSE 'balance_cdf' END;
    total_deduction := tx_amount + tx_fee;

    -- Lock rows
    PERFORM id FROM clients WHERE account_number IN (sender_account, recipient_account) FOR UPDATE;

    -- Check balance
    EXECUTE format('SELECT %I FROM clients WHERE account_number = $1', bal_col) INTO sender_bal USING sender_account;
    IF sender_bal < total_deduction THEN
        RAISE EXCEPTION 'Solde insuffisant.';
    END IF;

    -- Update Sender
    EXECUTE format('UPDATE clients SET %I = %I - $1 WHERE account_number = $2', bal_col, bal_col) USING total_deduction, sender_account;
    -- Update Recipient
    EXECUTE format('UPDATE clients SET %I = %I + $1 WHERE account_number = $2', bal_col, bal_col) USING tx_amount, recipient_account;

    -- Insert Transactions
    INSERT INTO transactions (type, client_account, counterparty, currency, amount, fee, status, details)
    VALUES ('Envoi', sender_account, recipient_account, tx_currency, -tx_amount, tx_fee, 'Reussi', 'Envoi vers ' || recipient_account);

    INSERT INTO transactions (type, client_account, counterparty, currency, amount, fee, status, details)
    VALUES ('Reception', recipient_account, sender_account, tx_currency, tx_amount, 0, 'Reussi', 'Reception depuis ' || sender_account);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 2. Process Withdrawal (retirer)
CREATE OR REPLACE FUNCTION process_withdrawal(
    p_account TEXT,
    p_currency TEXT,
    p_amount NUMERIC,
    p_fee NUMERIC,
    p_code TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    bal_col TEXT;
    curr_bal NUMERIC;
    total_deduction NUMERIC;
BEGIN
    bal_col := CASE WHEN p_currency = 'USD' THEN 'balance_usd' ELSE 'balance_cdf' END;
    total_deduction := p_amount + p_fee;

    PERFORM id FROM clients WHERE account_number = p_account FOR UPDATE;
    EXECUTE format('SELECT %I FROM clients WHERE account_number = $1', bal_col) INTO curr_bal USING p_account;
    
    IF curr_bal < total_deduction THEN
        RAISE EXCEPTION 'Solde insuffisant.';
    END IF;

    EXECUTE format('UPDATE clients SET %I = %I - $1 WHERE account_number = $2', bal_col, bal_col) USING total_deduction, p_account;

    INSERT INTO transactions (type, client_account, currency, amount, fee, status, details, code_retrait)
    VALUES ('Retrait', p_account, p_currency, -p_amount, p_fee, 'En attente', 'Code generé', p_code);

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
