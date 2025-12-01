"""Phase 2: Add users, update conversations and turns

Revision ID: 002
Revises: 001
Create Date: 2025-11-29

"""
from alembic import op
import sqlalchemy as sa

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create profiles table (not 'users' to avoid conflict with Supabase auth.users)
    op.create_table('profiles',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('target_language', sa.Enum('yoruba', 'hausa', 'igbo', name='languageenum'), nullable=True),
        sa.Column('proficiency_level', sa.Enum('beginner', 'intermediate', 'advanced', name='proficiencyenum'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_profiles_id'), 'profiles', ['id'], unique=False)
    op.create_index(op.f('ix_profiles_email'), 'profiles', ['email'], unique=True)
    
    # Drop old conversations table and recreate with new schema
    op.drop_index('ix_conversations_id', table_name='conversations')
    op.drop_table('turns')  # Drop turns first due to FK
    op.drop_table('conversations')
    
    # Create new conversations table
    op.create_table('conversations',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('scenario_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('active', sa.Boolean(), nullable=False, server_default='true'),
        sa.ForeignKeyConstraint(['user_id'], ['profiles.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversations_id'), 'conversations', ['id'], unique=False)
    op.create_index(op.f('ix_conversations_user_id'), 'conversations', ['user_id'], unique=False)
    op.create_index(op.f('ix_conversations_scenario_id'), 'conversations', ['scenario_id'], unique=False)
    
    # Create new turns table
    op.create_table('turns',
        sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
        sa.Column('conversation_id', sa.String(), nullable=False),
        sa.Column('turn_number', sa.Integer(), nullable=False),
        sa.Column('user_audio_url', sa.String(), nullable=True),
        sa.Column('user_transcription', sa.Text(), nullable=False),
        sa.Column('ai_response_text', sa.Text(), nullable=False),
        sa.Column('ai_response_audio_url', sa.String(), nullable=True),
        sa.Column('grammar_correction', sa.Text(), nullable=True),
        sa.Column('grammar_score', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_turns_id'), 'turns', ['id'], unique=False)
    op.create_index(op.f('ix_turns_conversation_id'), 'turns', ['conversation_id'], unique=False)


def downgrade() -> None:
    # Drop new tables
    op.drop_index(op.f('ix_turns_conversation_id'), table_name='turns')
    op.drop_index(op.f('ix_turns_id'), table_name='turns')
    op.drop_table('turns')
    
    op.drop_index(op.f('ix_conversations_scenario_id'), table_name='conversations')
    op.drop_index(op.f('ix_conversations_user_id'), table_name='conversations')
    op.drop_index(op.f('ix_conversations_id'), table_name='conversations')
    op.drop_table('conversations')
    
    op.drop_index(op.f('ix_profiles_email'), table_name='profiles')
    op.drop_index(op.f('ix_profiles_id'), table_name='profiles')
    op.drop_table('profiles')
    
    # Recreate old schema (simplified version)
    op.create_table('conversations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('language', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_conversations_id'), 'conversations', ['id'], unique=False)
