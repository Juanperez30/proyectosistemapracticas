"""Agregar columna estado a postulaciones

Revision ID: b4c9f7257505
Revises: 198efedbf2db
Create Date: 2025-05-02 15:27:44.606878

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b4c9f7257505'
down_revision: Union[str, None] = '198efedbf2db'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('postulaciones', sa.Column('estado', sa.String(), nullable=False, server_default='En proceso'))
    pass


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('postulaciones', 'estado')
    pass
